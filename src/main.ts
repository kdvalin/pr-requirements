import * as core from '@actions/core'
import * as github from '@actions/github'

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

  core.debug(pr.data.body || 'Empty body')
}
