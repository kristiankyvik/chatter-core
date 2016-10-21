Chatter = {
  options: {
    messageLimit: 1000,
    nickProperty: "username",
    initialRoomLoad: 5,
    editableNickname: true
  }
};

Chatter.configure = function (opts) {
  _.extend(this.options, opts);
};

/**
 * @summary Retrieves nickname of user.
 * @locus Server
 * @param {object} meteor user.
 * @returns {string} the nickname of the user.
 */
function getNickname(user) {
  const nickPath = Chatter.options.nickProperty;
  const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);

  return nick;
}

/**
 * @summary Adds user to Chatter and defines its privileges
 * @locus Server
 * @param params Information about the new user.
 * @param {string} params.userId Meteor user id.
 * @param {string} params.userType Defines the restricitons on the new user. Can either be set to "admin" or "standard".
 * @returns {string} chatterId
 */
Chatter.addUser = function(params) {
  check(params, {
    userId: String,
    admin: Match.Optional(Match.OneOf(Boolean, String, undefined)),
    supportUser: Match.Optional(Match.OneOf(String, undefined))
  });

  const {userId, supportUser, isAdmin} = params;

  const user = Meteor.users.findOne(userId);

  if (!user) {
    throw new Meteor.Error("user-does-not-exists", "user id provided is not correct");
  }

  const avatarURL = `http://api.adorable.io/avatars/${user.username}`;

  Meteor.users.update(
    {_id: userId},
    { $set: {
      "profile.isChatterUser": true,
      "profile.isChatterAdmin": isAdmin,
      "profile.chatterNickname": user.username,
      "profile.chatterAvatar": avatarURL,
      "profile.supportUser": supportUser
    }
  });

  return userId;
};

Chatter.setNickname = function(params) {
  check(params, {
    userId: String,
    nickname: String
  });

  const {userId, nickname} = params;

  const user = Meteor.users.findOne(userId);

  if (!user) {
    throw new Meteor.Error("user-does-not-exists", "user id provided is not correct");
  }

  Meteor.users.update(
    {_id: userId},
    { $set: {
      "profile.chatterNickname": nickname
    }
  });

  return userId;
};

/**
 * @summary Removes user from Chatter
 * @locus Server
 * @param params Information about the new user.
 * @param {string} params.userId Meteor user id.
 * @param {string} params.userType Defines the restricitons on the new user. Can either be set to "admin" or "standard".
 * @returns {string} chatterId
 */
Chatter.removeUser = function(params) {
  check(params, {
    userId: String
  });

  let {userId} = params;
  const user = Meteor.users.findOne(userId);

  if (!user) {
    throw new Meteor.Error("user-does-not-exists", "user id provided is not correct");
  }

  if (!user.profile.isChatterUser) {
    throw new Meteor.Error("user-is-not-chatter-user", "user is not a chatter user");
  }

  userId = user._id;

  Chatter.Message.remove({userId});
  Meteor.users.remove(userId);

  //removes all conversation of this user
  Chatter.UserRoom.find({userId}).fetch().forEach(function(userRoom) {
    const roomId = userRoom.roomId;
    const usersInRoom = Chatter.UserRoom.find({roomId}).count();
    if (usersInRoom < 3) {
      Chatter.Room.remove(roomId);
    }
    userRoom.remove();
  });

  return userId;
};

/**
 * @summary Adds empty room to Chatter.
 * @locus Server
 * @param {string} params Information about the new room.
 * @param {string} params.name The name of the room.
 * @param {string} params.description The description of the room.
 * @returns {string} roomId
 */
Chatter.addRoom = function(params) {
  check(params, {
    name: String,
    description: String,
    roomType: Match.Optional(Match.OneOf(String, undefined)),
    ref: Match.Optional(Match.OneOf(String, undefined))
  });

  const {name, description, roomType, ref} = params;
  const room = new Chatter.Room({
    name,
    description,
    roomType,
    ref
  })

  if (room.validate()) {
    return room.save();
  }

  room.throwValidationException();

};

/**
 * @summary Removes room from Chatter.
 * @locus Server
 * @param {string} roomId.
 */
Chatter.removeRoom = function(params) {
  check(params, {
    roomId: String
  });

  const room = Chatter.Room.findOne(params.roomId);
  if (!room) {
    throw new Meteor.Error("room-does-not-exist", "the value provided for the roomId is incorrect");
  }

  Chatter.UserRoom.remove({'roomId':{'$in':[room._id]}})
  return room.remove();
};

/**
 * @summary Adds user to room.
 * @locus Server
 * @param params Information about the new room.
 * @param {string} params.userId Unique string identifying user.
 * @param {string} params.roomId Unique string identifying the room.
 * @returns {string} the string of the userRoom
 */
Chatter.addUserToRoom = function(params) {
  check(params, {
    userId: String,
    roomId: String
  });

  const {userId, roomId} = params;
  const room = Chatter.Room.findOne(roomId);
  const user = Meteor.users.findOne(userId);


  if (!room) {
    throw new Meteor.Error("room-does-not-exist", "the value provided for the roomId is incorrect");
  }

  if (!user) {
    throw new Meteor.Error("user-does-not-exists", "user id provided is not correct");
  }

  const userRoom = new Chatter.UserRoom({
    userId,
    roomId
  })

  if (userRoom.validate()) {
    return userRoom.save();
  }

  userRoom.throwValidationException();
};


/**
 * @summary Removes user from room.
 * @locus Server
 * @param {string} params.userId Unique string identifying user.
 * @param {string} params.roomId Unique string identifying the room.
 */
Chatter.removeUserFromRoom = function(params) {
  check(params, {
    userId: String,
    roomId: String
  });

  const {userId, roomId} = params;
  const user = Meteor.users.findOne(userId);
  const room = Chatter.Room.findOne(roomId);

  if (!room) {
    throw new Meteor.Error("room-does-not-exist", "the value provided for the roomId is incorrect");
  } else if (!user) {
    throw new Meteor.Error("user-does-not-exists", "user id provided is not correct");
  }

  const userRoom = Chatter.UserRoom.findOne({roomId, userId: user._id});

  if (!userRoom) {
    throw new Meteor.Error("user-has-not-been-added-to-room", "the user had not been added to room ");
  }

  return userRoom.remove();
};
