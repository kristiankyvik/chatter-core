const Chatter = {
  options: {
    messageLimit: 25,
    nickProperty: "username",
    initialRoomLoad: 5,
    editableNickname: false,
    chatName: "Chatter",
    customToggleHandlers: false,
    defaultUsers: [],
    supportUserReference: "_id"
  }
};

Chatter.configure = function (opts) {
  _.extend(this.options, opts);
};

Chatter.getNickname = function (user) {
  const userId = user._id;
  for (var i = 0, path = this.options.nickProperty.split('.'), len = path.length; i < len; i++) {
    if (user[path[i]] === undefined) {
      console.log("[CHATTER]: Chatter nickname path does not match user attribute");
      return userId;
    }
    if ( user[path[i]].constructor === Array ) {
      user = user[path[i]][ path[i + 1]];
      i++;
    } else {
      user = user[path[i]];
    }
  }
  return user;
};

export default Chatter;
