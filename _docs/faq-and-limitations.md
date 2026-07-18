# FAQ and limitations

## Can I undo a deletion?

No. Deleted workflow runs, along with their logs and artifacts, are gone for good. Run with
`dry-run: true` first to see what would be deleted.

## Does `keep-latest` apply across the whole repo or per workflow?

Per workflow. If you have 3 workflows and set `keep-latest: 5`, up to 5 runs are kept for each
one, not 5 total.

## Will this ever delete an in-progress run?

It shouldn't in practice. Runs are selected by creation date, and an in-progress run is by
definition recent, so it won't be older than a `days-ago` cutoff of any reasonable size. If
GitHub does reject a deletion because a run is still active, that single deletion fails and the
action continues with the rest.

## Does this work across a fork's pull requests?

The action only ever looks at the repository it runs in, using the repo checked out by
`actions/checkout`. It has no cross-repo or cross-fork reach.

## Will this hit GitHub API rate limits on a repo with a lot of runs?

It's possible on repos with a very large history, since every run is fetched before filtering.
If you hit this, run less frequently (e.g. daily instead of hourly) or lower `days-ago` so there
is less backlog to clear on the first run.

## Does deleting a workflow run affect anything else?

Yes: its logs and any artifacts uploaded during that run are deleted along with it.
