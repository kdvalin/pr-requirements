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
  const octokit = github.getOctokit(core.getInput('myToken'))
}
