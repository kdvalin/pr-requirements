import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

function get_jira_slug(
  content: string | null | undefined,
  project: string
): string | null {
  if (!content) return null
  const prefix = 'Relates to JIRA: '
  const reg = new RegExp(`${prefix}${project}-[0-9]+`)
  const matches = content.match(reg)
  if (!matches || matches.length === 0) {
    return null
  }

  return matches[0].substring(prefix.length)
}

async function is_valid_issue(
  issue_num: number,
  octokit: InstanceType<typeof GitHub>
): Promise<boolean> {
  core.info(`Searching for issue #${issue_num}`)
  let issue = null
  try {
    issue = await octokit.rest.issues.get({
      repo: github.context.issue.repo,
      owner: github.context.issue.owner,
      issue_number: issue_num
    })
    if (issue.status >= 400) {
      // 400+ is error zone
      core.info(`Could not find issue #${issue_num}`)
      return false
    }
    core.info(`Found issue #${issue_num}`)
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    core.warning(`Unknown error fetching issue, ${err}`)
    return false
  }
  return issue && !issue.data.pull_request
}

async function has_related_issue(
  body: string | null | undefined,
  octokit: InstanceType<typeof GitHub>
): Promise<boolean> {
  if (!body) {
    return false
  }

  const issue_matches = body.match(/#[0-9]+/)

  if (!issue_matches) {
    return false
  }
  for (const match of issue_matches) {
    const valid_issue = await is_valid_issue(
      parseInt(match.substring(1)),
      octokit
    )

    if (valid_issue) {
      return true
    }
  }

  return false
}
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  if (github.context.eventName !== 'pull_request') {
    core.setFailed(
      `This action expects pull_request event types, received ${github.context.eventName}`
    )
    return
  }
  const token = core.getInput('GITHUB_TOKEN', { required: true })
  const octokit = github.getOctokit(token)
  core.info(`Looking at PR ${github.context.issue.number}`)
  const repo_info = {
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number
  }

  const pr = await octokit.rest.issues.get(repo_info)
  core.info(`Found PR ${github.context.issue.number}`)
  const pr_body = pr.data.body
  const related_issue_check = core.getBooleanInput('related_issue')
  if (related_issue_check) {
    const pr_has_related_issue = await has_related_issue(pr_body, octokit)
    if (!pr_has_related_issue) {
      core.setFailed('PR has no related issue')
      return
    }
  }

  const jira_issue_check = core.getBooleanInput('jira_ticket')
  if (jira_issue_check) {
    const jira_project = core.getInput('jira_project')
    const jira_url = core.getInput('jira_url')

    if (!jira_url) {
      core.setFailed(
        'Need jira URL to have a comment containing the jira ticket'
      )
      return
    }
    if (!jira_project) {
      core.setFailed('Need project stub for linking to jira ticket')
      return
    }

    const jira_slug = get_jira_slug(pr_body, jira_project)
    if (!jira_slug) {
      core.setFailed('PR does not have a Jira ticket associated with it')
      return
    }
    const comment_body = `This relates to [${jira_slug}](${jira_url}/browse/${jira_slug})`

    const comments = await octokit.rest.issues.listComments(repo_info)

    core.info(`Searching for Jira comment`)
    let comment_exists = false
    comments.data.forEach(val => {
      if (val.body === comment_body) {
        comment_exists = true
      }
    })

    if (!comment_exists) {
      core.info(`Did not find Jira comment, adding.`)
      await octokit.rest.issues.createComment({
        ...repo_info,
        body: comment_body
      })
    }
  }
}
