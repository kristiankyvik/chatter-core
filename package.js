
Package.describe({
  name: 'hubroedu:chatter-core',
  version: '0.1.0',
  summary: 'Models and chat functionality for chatter',
  git: 'git@gitlab.com:hubroedu/chatter-core.git',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.4.2.3');

  api.use('ecmascript');
  api.use('underscore');
  api.use('mongo');
  api.use('check');
  api.use('accounts-base');

  api.use('momentjs:moment@2.8.4');
  api.use('jagi:astronomy@2.3.6');
  api.use('jagi:astronomy-timestamp-behavior@2.0.0');
  api.use('xolvio:cleaner');
  api.use('reywood:publish-composite');
  api.use('tmeasday:publish-counts@0.8.0');
  api.use('meteorhacks:unblock');
  api.use('meteorhacks:fast-render');
  api.use('cottz:publish-relations@2.0.7');
  api.use('mizzao:user-status@0.6.6');

  api.addFiles('chatter.js');
  api.addFiles('models/message.js');
  api.addFiles('models/room.js');
  api.addFiles('models/userroom.js');

  api.addFiles([
    'server/publish.js',
    'server/access.js',
    'server/methods.js'
  ], 'server');

  api.addFiles([
    'shared/methods.js',
    'utils.js'
  ], ['client', 'server']);

  api.export([
    'Chatter',
  ], ['client', 'server']);

  api.mainModule("main.js");
});

Package.onTest(function (api) {
  api.use('accounts-base');
  api.use('ecmascript');
  api.use('practicalmeteor:chai');
  api.use('hubroedu:chatter-core');
  api.use('xolvio:cleaner');
  api.use('practicalmeteor:sinon');
  api.addFiles([
    'server-tests/test-helpers.js'

  ], 'server');
  api.mainModule('chattercore.server.tests.js', 'server');
  api.mainModule('chattercore.client.tests.js', 'client');
});
