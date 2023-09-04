# Changesets
[Changesets documentation](https://github.com/changesets/changesets#readme) &bull; [Changesets common questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)

<br>

## Commands

| Command | Description |
| --- | --- |
| `npx changeset` | Create a changeset. On commit & push, the Actions workflow will create a PR that versions the package and publishes it on merge. |
| `npx changeset status` | Shows info on the current changesets. |
| `npx changeset version` | Versions the package and updates the changelog using the previously created changesets. |
| `npx changeset publish --otp=TOKEN` | Publishes to npm. Should be run after the changes made by `version` are pushed to main. Don't create any commits in between! |
