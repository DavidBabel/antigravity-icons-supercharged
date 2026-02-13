## Contribute

### Something is missing for your usage ?

You can contribute easily to the project by adding a new folder in the `override` folder.
Take look at : `./override/<contribute>/`
And just duplicate it.

### Build

```bash
bun install
bun run contribute
```

It generate `build-<color>/symbol-icon-theme.json` which is a concatenation of :

- all the icon files in the `vscode-symbols/src/icons` folder
- then all plugins added in the subfolders of the `override` folder.

```jsonc
{
  // rename this file and add the fields you need
  // it will be merged with the others icons
  // check other override to understand how it works
  // once done :
  // turn this file into a .json file & remove the comments
  "iconDefinitions": {},
  "fileExtensions": {},
  "fileNames": {},
  "languageIds": {},
  // Note: only target folder without the "-closed" suffix, it will be added automatically
  "folderNames": {},
  // add a file/folder with this name `file-types` to be able to test it
}
```
