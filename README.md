# PR Requirement Action

This GitHub Action is meant to help enforce certain PR requirements, such as
referencing an issue or referencing a Jira ticket. This action will fail if the
specified requirements are not fulfilled.

## Supported Requirements

Currently the following requirements can be enforced with this action.

- Referencing an issue from within the repository
- Referencing a Jira ticket, in a format that
  [Sync2Jira](https://github.com/release-engineering/Sync2Jira) expects
  - `Relates to Jira: <Project>-<Ticket Number>`
  - This action will add a comment to the PR with a link to the Jira ticket

## Usage

An example workflow is provided below

```yaml
on:
  pull_request:
    branches:
      - main

permissions:
  contents: read
  pull-requests: write # Need write to make comments

jobs:
  check_pr:
    name: Check PR
    runs-on: ubuntu-latest
    steps:
      - uses: kdvalin/pr-requirements
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Needed to read PR descriptions
```

### Options

- GITHUB_TOKEN
  - Used to get PR descriptions, use `${secrets.GITHUB_TOKEN}` within your
    workflow file.
  - type: string
  - default: `null`
- related_issue
  - Checks if the PR has a related issue in it's description
  - type: boolean
  - default: true
- jira_ticket
  - Checks if the PR has a Jira ticket mentioned in it's description, requires
    `jira_project` and `jira_url` to be defined
  - type: boolean
  - default: false
- jira_project
  - The Jira project slug that should be searched for within the PR description
  - type: string
  - default: Example
- jira_url
  - The URL to the Jira instance where the ticket lives, this is to provide a
    comment in the PR linking to the ticket
  - type: string
  - default: `null`
