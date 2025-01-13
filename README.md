# PR Requirement Action

This GitHub action is meant to help enforce certain PR requirements, such as
referencing an issue or referencing a JIRA ticket. This action will fail if the
specified requirements are not fulfilled.

## Supported Requirements

Currently the following requirements can be enforced with this action.

- Referencing an issue from within the repository
- Referencing a JIRA ticket, in a format that
  [Sync2Jira](https://github.com/release-engineering/Sync2Jira) expects
  - `Relates to JIRA: <Project>-<Ticket Number>`
  - This action will add a comment to the PR with a link to the JIRA ticket

# Usage

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

## Options

| variable name | type    | default | notes                                                                                                                  |
| ------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| GITHUB_TOKEN  | string  | `null`  | Used to get PR descriptions, use `${secrets.GITHUB_TOKEN}` within your workflow file.                                  |
| related_issue | boolean | true    | Checks if the PR has a related issue in it's description                                                               |
| jira_ticket   | boolean | false   | Checks if the PR has a jira ticket mentioned in it's description, requires `jira_project` and `jira_url` to be defined |
| jira_project  | string  | Example | The JIRA project slug that should be searched for within the PR description                                            |
| jira_url      | string  | `null`  | The URL to the JIRA instance where the ticket lives, this is to provide a comment in the PR linking to the ticket      |
