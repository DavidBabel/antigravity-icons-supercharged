<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/header.png" alt="Antigravity Icons Supercharged" width="460">

A fork from [miguelsolorio/vscode-symbols](https://github.com/miguelsolorio/vscode-symbols), main icons used in **[Antigravity](https://antigravity.google/)** the fork of [vscode](https://github.com/microsoft/vscode) made by [Google](https://github.com/google).

_Mainly created for personnal use._

## Preview

### Folded folder status icons

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder.png" alt="folder"> <img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-closed.png" alt="folder-closed">

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-config.png" alt="folder-config"> <img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-config-closed.png" alt="folder-config-closed">

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-github.png" alt="folder-github"> <img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-github-closed.png" alt="folder-github-closed">

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-green.png" alt="folder-green"> <img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-green-closed.png" alt="folder-green-closed">

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-orange-code-1.png" alt="folder-orange-code-1"> <img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/folded/folder-orange-code-1-closed.png" alt="folder-orange-code-1-closed">

### Some new icons

<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/new-icons/travis.png" alt="travis">
<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/new-icons/npm-full.png" alt="npm-full">
<img src="https://raw.githubusercontent.com/DavidBabel/antigravity-icons-supercharged/main/images/preview/new-icons/archive.png" alt="archive">

... and more to come

### New folder style

[TODO]

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [miguelsolorio/vscode-symbols](https://github.com/miguelsolorio/vscode-symbols)
- [vscode](https://github.com/microsoft/vscode)
- [Antigravity](https://antigravity.google/)
