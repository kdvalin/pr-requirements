import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

async function is_valid_issue(
  issue_num: number,
  octokit: InstanceType<typeof GitHub>
): Promise<boolean> {
  const issue = await octokit.rest.issues.get({
    repo: github.context.issue.repo,
    owner: github.context.issue.owner,
    issue_number: issue_num
  })
  if (issue.status >= 400) {
    // 400+ is error zone
    return false
  }

  return !issue.data.pull_request
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

  const pr = await octokit.rest.issues.get({
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number
  })

  const related_issue_check = core.getBooleanInput('related_issue')
  if (related_issue_check) {
    const pr_has_related_issue = await has_related_issue(pr.data.body, octokit)
    if (!pr_has_related_issue) {
      core.setFailed('PR has no related issue')
      return
    }
  }
}
