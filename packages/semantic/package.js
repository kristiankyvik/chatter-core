/*globals Package, Npm*/
Package.describe({
  name        : 'essentials:semantic-ui',
  version     : '2.2.4',
  description : 'A wrapper for semantic-ui',
});

Npm.depends({
  'semantic-ui-css': '2.2.4',
});

Package.onUse(function (api) {
  api.versionsFrom('1.4');
  api.use('jquery', 'client');
  api.addFiles([
    '.npm/package/node_modules/semantic-ui-css/semantic.js',
    '.npm/package/node_modules/semantic-ui-css/semantic.css',
  ], 'client');
  api.addAssets([
    '.npm/package/node_modules/semantic-ui-css/themes/default/assets/fonts/icons.eot',
    '.npm/package/node_modules/semantic-ui-css/themes/default/assets/fonts/icons.otf',
    '.npm/package/node_modules/semantic-ui-css/themes/default/assets/fonts/icons.svg',
    '.npm/package/node_modules/semantic-ui-css/themes/default/assets/fonts/icons.ttf',
    '.npm/package/node_modules/semantic-ui-css/themes/default/assets/fonts/icons.woff',
    '.npm/package/node_modules/semantic-ui-css/themes/default/assets/fonts/icons.woff2',
  ], 'client');
});
