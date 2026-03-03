# Project blueprint

This is a blueprint for new git managed js/ts projects with configs for both
[VS Code](https://code.visualstudio.com/) and [Zed](https://zed.dev/).

It configures git, npm, editorconfig and prettier or biome.

## Usage

These steps will create the folder for your new project. It should not exist
beforehand.

The normal steps when using this is to navigate to the parent of your new
project folder and issue these commands:

```sh
git clone https://github.com/tregusti/project-blueprint PROJECT_NAME
cd PROJECT_NAME
```

### Toolchain selection

There are two branches to consider.

- `main`: Contains configuration for Prettier.
- `biome`: Contains configuration for Biome. Always based on `main`.

Switch to the branch of the toolchain you prefer.

```sh
git switch biome
```

### History

If you do not want to keep the history of this repo in your new project, then
recreate the git repo.

```sh
rm -rf .git
git init
```
