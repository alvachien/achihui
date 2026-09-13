---
name: bump-version
description: Bump the achihui app version across package.json and the environment files, refresh the release date, verify the build, and optionally create a release commit. Invoke when the user asks to bump/release/version the app.
---

# Bump Version

The version string lives in **three** places that must stay in sync, plus a `ReleasedDate` field in the environment files:

| File | Field(s) |
|---|---|
| `package.json` | `version` |
| `src/environments/environment.ts` | `CurrentVersion`, `ReleasedDate` |
| `src/environments/environment.prod.ts` | `CurrentVersion`, `ReleasedDate` |

(`environment.azureprod.ts` was removed; the helper script still lists it for
history but silently skips any environment file that is not present.)

The About page (`src/app/pages/about/about.component.ts`) reads `environment.CurrentVersion`.

## Version scheme

Semver `MAJOR.MINOR.PATCH` (e.g. `1.8.419`). PATCH is a running number, not strictly +1 - always confirm the target with the user.

## Steps

1. **Determine the target version.** If the user gave an explicit version (e.g. `1.8.420`), use it. Otherwise ask whether to bump `patch` / `minor` / `major` and compute it from the current `package.json` version.
2. **Apply the bump** by running the helper script that ships with this skill - never edit the version fields by hand, so the files cannot drift:
   ```bash
   node .claude/skills/bump-version/bump-version.mjs <X.Y.Z>
   ```
   This updates `package.json` and every present environment file, and sets `ReleasedDate` to today's date (`YYYY.MM.DD`, matching the format already used in those files).
3. **Verify sync** - confirm all files report the same version:
   ```bash
   grep -nE "CurrentVersion|ReleasedDate" src/environments/environment.ts src/environments/environment.prod.ts && grep -nE '"version"' package.json
   ```
4. **Verify the build** (recommended):
   ```bash
   ng build --configuration development
   ```
5. **Commit only if the user explicitly asks.** Follow the repo convention from git history:
   ```
   chore: bump version to <X.Y.Z>
   ```
   Stage `package.json` and the environment files. Per project rules, never commit unless requested.

## Notes

- If the user also wants a git tag, the repo currently has no tagging convention - ask first.
- The helper script lives next to this file at `.claude/skills/bump-version/bump-version.mjs` so the skill is self-contained.
