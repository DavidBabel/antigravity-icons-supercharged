# Contribute

## Something is missing for your usage ?

You can contribute easily to the project by adding a new folder in the `override` folder.

To do so :

```bash
git clone git@github.com:DavidBabel/antigravity-icons-supercharged.git
bun install
# Then start contribute by running :
bun run contrib
```

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/contrib.gif" alt="contrib">

It will open the new generated json file in the `override` folder.
Depending on your choices, juste take a look at the other override files to understand how it works.
It is dead simple.

## Build

The command `bun run build` will generate the `build-<color>/symbol-icon-theme.json` file.
This file is a concatenation of :

- all the icon files in the submodule `vscode-symbols/src/icons` folder.
- then it merges all the content of the plugins added in the subfolders of the `override` folder.

## Test

```bash
bun run test
```
