// Atention! This makes all users chatter users by default!
if (Meteor.isServer) {
  Accounts.onCreateUser(function (options, user) {
    user.profile = options.profile ? options.profile : {};
    user.profile.isChatterUser = true;
    user.profile.chatterNickname = user.username;
    user.profile.supportUser = null;
    return user;
  });
}

