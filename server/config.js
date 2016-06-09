Accounts.onCreateUser(function(options, user) {
  user.profile = options.profile ? options.profile : {};
  // TDOD; change to default false
  user.profile.isChatterUser = true;
  user.profile.isChatterAdmin = true;
  user.profile.chatterNickname = user.username;
  user.profile.chatterAvatar = `http://api.adorable.io/avatars/${user.username}`;
  return user;
});
