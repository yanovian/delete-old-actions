# Release a new version

Run the matching release target:
```bash
make release-patch   # bug fixes
make release-minor   # new backwards-compatible features
make release-major   # breaking changes
```

Each one bumps `package.json`'s version, commits it (`Release vX.Y.Z`), tags it, and pushes.
That's it — [`.github/workflows/release.yml`](../.github/workflows/release.yml) picks up the pushed tag and:
- runs lint/tests
- force-moves the major tag (e.g. `v1`) to point at the new release
- creates the GitHub Release, titled `Release vX.Y.Z`, with GitHub's auto-generated notes (commits/PRs since the last tag)
- GitHub Marketplace picks up the new release automatically — no manual step needed, **except once** (see below)

## One-time Marketplace setup
The very first time this action is ever published to the Marketplace, GitHub requires publishing a release
manually through the web UI so you can pick categories and accept the Marketplace Developer Agreement —
this can't be done through the API or `action.yml`. Use:
- Primary category: **Continuous Integration**
- Secondary category: **Utilities**

After that one-time setup, every release created by the `release.yml` workflow (steps above) automatically
updates the existing Marketplace listing — no need to repeat this.
