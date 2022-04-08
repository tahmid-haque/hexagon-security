This project was bootstrapped with React Chrome Extension TypeScript boilerplate.
All actions below need to be done from the root repo directory.

## Getting Started

1. `yarn install` to install dependancies
2. `yarn run extension` to start running the fast development mode Webpack build process that bundle files into the `dist` folder
3. `yarn workspace hexagon-extension add <package_name>` to install new packages

## Loading The Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle on `Developer mode` in the top right corner
3. Click `Load unpacked`
4. Select the entire `dist` folder

## Production Build

1. `yarn run extension-build` to generate a minimized production build in the `dist` folder
2. ZIP the entire `dist` folder (e.g. `dist.zip`)
3. Publish the ZIP file on the Chrome Web Store Developer Dashboard!
