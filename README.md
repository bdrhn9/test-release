## Versioning and release

There is a script that automates the process of creating new NPM packages and Docker images. Full release procedure:

1. `pnpm run create-release:npm [major|minor|patch]` - The script ensures publishing happens from up-to-date `main`
   branch. It updates the package version, does basic checks to ensure the changes are valid and creates a version commit. The command intentionally does not do the publishing so that the changes can be reviewed before pushing.
2. `git show` - To inspect the changes of the version commit.
3. `git push` - Push the version commit upstream. This will trigger the `tag-and-release` GitHub Actions job and result
   in 1) the commit being tagged with the new version, 2) the release being created on GitHub
