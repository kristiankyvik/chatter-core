
# Chatter, the core functionality
---

## WARNING: Pre-Alpha state, bugs and missing functionality everywhere!

This package contains models and functionality for Chatter, and can be used with your own UI package. Otherwise, see the [chatter-semantic]() package for a full UI package.

Chatter has the ambition of becoming an easy to set up in-app chat package that requires minimal configuration to run, yet can be heavily customized to fit your needs should you wish. The current state of in-app chat felt lacking, hence this project was born. I will be using this in my own production apps, so it will not be going away in the near future.

## Usage

### Add the package

By adding it to your packagesfile or running the following command:

```
meteor add jorgeer:chatter-core
```

### Add fields to accounts model

In order for it to work you need to add some fields to the Accounts model. This can be done by adding the following and run in on the server on startup

```javascript
  Accounts.onCreateUser(function (options, user) {
    user.profile = options.profile ? options.profile : {};
    user.profile.chatterNickname = Chatter.getNickname(user);
    user.profile.supportUser = null;
    return user;
  });
```

### Tests

In order to run the test packages simpy run the following command in the root of your meteor app

```
meteor test-packages ./packages/chattercore --port 3100 --driver-package practicalmeteor:mocha
```
