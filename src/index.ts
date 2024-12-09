/**
 * The entrypoint for the action.
 */
import { run } from './main'
import * as core from '@actions/core'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
try {
  run()
} catch (error) {
  if (error instanceof Error) {
    core.setFailed(error.message)
  } else {
    core.setFailed('Unknown error')
  }
}
