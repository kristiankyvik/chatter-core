Package.describe({
  name: 'chatter:core',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Models and chat functionality for chatter',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  
  api.use('ecmascript');
  api.use('jagi:astronomy');
  api.use('jagi:astronomy-timestamp-behaviour');
  
  api.addFiles('chattercore.js');
  api.addFiles('models/message.js');
  api.addFiles('models/room.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('chattercore');
  api.addFiles('chattercore-tests.js');
  
  api.export([
    'Chatter',
  ]);
});
