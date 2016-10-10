if (Meteor.isServer) {
  Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile ? options.profile : {};
    user.profile.isChatterUser = true;
    user.profile.chatterNickname = user.username;
    user.profile.supportUser = null;
    return user;
  });

  if ( Meteor.users.find().count() === 0 ) {
    Accounts.createUser({
      username: 'chatter-admin',
      password: 'chatter-admin'
    });
  }
}

