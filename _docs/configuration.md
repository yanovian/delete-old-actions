# Configuration

All inputs for the `yanovian/prune-old-actions@v1` action.

| Input | Required | Default | Description |
|---|---|---|---|
| `token` | Yes | - | GitHub token used to list and delete workflow runs. Usually `${{ secrets.GITHUB_TOKEN }}`. See [permissions](../README.md#token-permissions). |
| `days-ago` | Yes | - | Delete runs older than this many days, based on the run's creation date. |
| `dry-run` | No | `false` | When `true`, logs which runs would be deleted without deleting them. |
| `keep-latest` | No | `0` | Number of most recent runs to keep, per workflow. `0` disables this and only `days-ago` applies. |

## How runs are selected

Runs are grouped by workflow. Within each workflow, the `keep-latest` most recent runs are
always kept, and of the remaining runs, any older than `days-ago` are deleted.

Example: `days-ago: 30` and `keep-latest: 5` on a workflow with 20 runs. The 5 most recent runs
are kept regardless of age. Of the other 15, any created more than 30 days ago are deleted.

## Minimal workflow

```yaml
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  prune-old-actions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: yanovian/prune-old-actions@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          days-ago: 30
```

See the [README](../README.md#usage) for more examples, including `dry-run` and `keep-latest`.
