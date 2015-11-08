Package.describe({
  name: 'chatter:core',
  version: '0.0.1',
  summary: 'Models and chat functionality for chatter',
  git: 'https://github.com/jorgeer/chatter-core',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  
  api.use('ecmascript');
  api.use('underscore');
  api.use('mongo');
  api.use('check');
  api.use('accounts-base');
  
  api.use('jagi:astronomy');
  api.use('jagi:astronomy-timestamp-behavior');
  
  api.addFiles('chattercore.js');
  api.addFiles('models/message.js');
  api.addFiles('models/room.js');
  
  api.addFiles('server/publish.js', 'server');
  
  api.export([
    'Chatter',
  ], ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('chattercore');
  api.addFiles('chattercore-tests.js');
  
});
