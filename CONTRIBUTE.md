## Contribute

### Something is missing for your usage ?

You can contribute easily to the project by adding a new folder in the `override` folder.
Take look at : `./override/<contribute>/`

### Build

```bash
bun install
# Update vendor icons from the vscode-symbols repository
bun run sync-vendor
# create the outpur in `build` folder
bun run build
```

It generate `build/symbol-icon-theme.json` which is a concatenation of all the icon files in the `vscode-symbols/src/icons` folder and all plugin added in `override` folder.
