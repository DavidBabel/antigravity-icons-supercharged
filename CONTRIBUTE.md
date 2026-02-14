# Contribute

## Something is missing for your usage ?

You can contribute easily to the project by adding a new folder in the `override` folder.
Take look at : `./override/<contribute>/`
And just duplicate it.

## Build

```bash
git clone git@github.com:DavidBabel/antigravity-icons-supercharged.git
bun install
# Then start contribute by runninh :
bun run contribute
```

It will open a new file in the `override` folder.
Depending on your choices, juste take a look at the other override files to understand how it works.
It is dead simple.

## How does it work ?

The command `bun run build` will generate the `build-<color>/symbol-icon-theme.json` file.
It generate `build-<color>/symbol-icon-theme.json` which is a concatenation of :

- all the icon files in the `vscode-symbols/src/icons` folder
- then all plugins added in the subfolders of the `override` folder.

## Test

```bash
bun run test
```
