<div align="center">

[![License](https://img.shields.io/github/license/yanovian/delete-old-actions?color=blue&label=License&style=flat-square)](https://github.com/yanovian/delete-old-actions/blob/main/LICENSE.md)
[![Last commit](https://img.shields.io/github/last-commit/yanovian/delete-old-actions.svg?color=blue&style=flat-square)](https://github.com/yanovian/delete-old-actions/commits/main)
[![Contributors](https://img.shields.io/github/contributors/yanovian/delete-old-actions?color=blue&style=flat-square)](https://github.com/yanovian/delete-old-actions/graphs/contributors)
[![Marketplace](https://img.shields.io/badge/marketplace-Prune%20Old%20GitHub%20Actions%20Runs-blue?style=flat-square&logo=github)](https://github.com/marketplace/actions/prune-old-github-actions-runs)
</div>

# About

Removes old GitHub Actions runs to keep your repository clean.
You are advised to run this action with the dry-run option first to see what will be deleted.  
When you are ready to use this, you can schedule it to check periodically.

**WARNING: Deletion cannot be undone. Use at your own risk.**

## Migrating from the old action
This action used to live under the `yanovation` org and was listed on the Marketplace as
[Delete Old GitHub Actions Runs](https://github.com/marketplace/actions/delete-old-github-actions-runs). That listing is now deprecated.

If you're coming from there, just replace the `uses:` string with `yanovian/delete-old-actions@v1` — everything else (inputs, behavior) stays the same, no other changes needed.

## Usage

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Specify your own schedule

jobs:
  prune-old-actions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: yanovian/delete-old-actions@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          days-ago: 30
```

Or you can test with dry-run option:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  prune-old-actions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: yanovian/delete-old-actions@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          days-ago: 30
          dry-run: true 
```

You can also keep the last N runs (N = 5 in this example):

```yaml
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  prune-old-actions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: yanovian/delete-old-actions@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          days-ago: 30
          dry-run: true
          keep-latest: 5
```

## Options

* `token`: The GitHub token to use for authentication. (**required**)
* `days-ago`: The number of days ago to delete the runs. (**required**)
* `dry-run`: If set to true, the Action will only list the runs to be deleted without actually deleting them. (**optional**,
  default: false, meaning it will delete the runs)
* `keep-latest`: The number of latest runs to keep. (**optional**, default: 0, meaning this option is disabled)

For the token, you can just use the `{{ secrets.GITHUB_TOKEN }}` which is a default secret that GitHub provides to each
run. You can read more about
it [here](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication).

## Token permissions
If you want to use the default `${{ secrets.GITHUB_TOKEN }}`, you should give it a write permissions either on the 
repository or organization level:  
![How to give default write access to GITHUB_TOKEN](/_docs/img/github-token-permission.png)  
You can read more about it [here](https://docs.github.com/en/actions/security-guides/automatic-token-authentication).  
This is **the easiest way**, especially if you have multiple repositories within multiple organizations and have access to 
update this setting, but **gives too much access to the token**.

Alternatively, you can authenticate with a GitHub App (needs more setup):
```yaml
...
    steps:
      - name: Generate a token
        id: generate-token
        uses: actions/create-github-app-token@v1
        with:
          app-id: ${{ vars.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - uses: yanovian/delete-old-actions@v1
        with:
          token: ${{ steps.generate-token.outputs.token }}
          days-ago: 30
```
You can read more about it [here](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow#authenticating-with-a-github-app).

Also, another option is to create a [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
Make sure to give the token the least needed access.

## Other docs

- [How to release](./_docs/release.md)
- [How to contribute](./CONTRIBUTING.md)
- [License](./LICENSE.md)
- [Change log](./CHANGELOG.md)

## Articles (to learn more about it)
- [Automatically delete old GitHub Actions runs](https://pooyan.info/articles/delete-old-github-actions-runs)
