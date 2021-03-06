import Chatter from "./chatter.js";

/**
 * @summary Adds user to Chatter and defines its privileges
 * @locus Server
 * @param params Information about the new user.
 * @param {string} params.userId Meteor user id.
 * @param {string} params.userType Defines the restricitons on the new user. Can either be set to "admin" or "standard".
 * @returns {string} chatterId
 */

Chatter.addUser = function (params) {
  check(params, {
    userId: String,
    admin: Match.Maybe(Match.OneOf(Boolean, null, undefined)),
    supportUser: Match.Maybe(Match.OneOf(String, null, undefined))
  });

  const {userId, supportUser, admin} = params;
  const isAdmin = admin ? true : false;
  const user = Meteor.users.findOne(userId);

  if (_.isEmpty(user)) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  Meteor.users.update(
    {_id: userId},
    { $set: {
      "profile.isChatterAdmin": isAdmin,
      "profile.chatterNickname": Chatter.getNickname(user),
      "profile.supportUser": supportUser
    }}
  );

  return userId;
};

Chatter.setNickname = function (params) {
  check(params, {
    userId: String,
    nickname: String
  });

  const {userId, nickname} = params;

  const user = Meteor.users.findOne(userId);

  if (_.isEmpty(user)) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  Meteor.users.update(
    {_id: userId},
    { $set: {"profile.chatterNickname": nickname}}
  );

  return userId;
};

Chatter.setSupportUser = function (params) {
  check(params, {
    userId: String,
    supportUserRef: Match.Maybe(Match.OneOf(String, null))
  });

  const {userId, supportUserRef} = params;

  const user = Meteor.users.findOne(userId);

  if (_.isEmpty(user)) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  Meteor.users.update(
    {_id: userId},
    { $set: {"profile.supportUser": supportUserRef}}
  );

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
Chatter.removeUser = function (params) {
  check(params, {
    userId: String
  });

  let {userId} = params;
  const user = Meteor.users.findOne(userId);

  if (_.isEmpty(user)) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  userId = user._id;

  Chatter.Message.remove({userId});
  Meteor.users.remove(userId);

  Chatter.UserRoom.find({userId}).fetch().forEach(function (userRoom) {
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
Chatter.addRoom = function (params) {
  check(params, {
    name: String,
    description: String,
    roomType: Match.Maybe(Match.OneOf(String, null, undefined)),
    ref: Match.Maybe(Match.OneOf(String, null, undefined)),
    deletable: Match.Maybe(Match.OneOf(Boolean, null, undefined)),
  });

  const {name, description, roomType, ref, deletable} = params;

  const room = new Chatter.Room({
    name,
    description,
    roomType,
    ref,
    deletable: deletable ? true : false
  });

  return room.save();
};

/**
 * @summary Removes room from Chatter.
 * @locus Server
 * @param {string} roomId.
 */
Chatter.removeRoom = function (params) {
  check(params, {
    roomId: String
  });

  const room = Chatter.Room.findOne(params.roomId);
  if (_.isEmpty(room)) {
    throw new Meteor.Error("room-does-not-exist", "room id provided is not correct");
  }

  Chatter.UserRoom.remove({'roomId': {'$in': [room._id]}});
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
Chatter.addUserToRoom = function (params) {
  check(params, {
    userId: String,
    roomId: String
  });

  const {userId, roomId} = params;
  const room = Chatter.Room.findOne(roomId);
  const user = Meteor.users.findOne(userId);

  if (_.isEmpty(room)) {
    throw new Meteor.Error("room-does-not-exist", "room id provided is not correct");
  } else if (_.isEmpty(user)) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  Chatter.UserRoom.upsert({
    userId,
    roomId
  }, {
    $set: {
      userId,
      roomId
    }
  });

  return roomId;
};

/**
 * @summary Adds message to room.
 * @locus Server
 */
Chatter.addMsgToRoom = function (params) {
  check(params, {
    userId: String,
    roomId: String,
    message: String
  });

  const {userId, roomId, message} = params;
  const room = Chatter.Room.findOne(roomId);
  const user = Meteor.users.findOne(userId);

  if (!message.length > 0 || message.length > 1000) throw new Meteor.Error("Message cannot be empty or exceed 1000 char");

  if (_.isEmpty(room)) {
    throw new Meteor.Error("room-does-not-exist", "room id provided is not correct");
  } else if (_.isEmpty(user)) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  new Chatter.Message({
    message,
    userId,
    roomId
  }).save();
};

/**
 * @summary Removes user from room.
 * @locus Server
 * @param {string} params.userId Unique string identifying user.
 * @param {string} params.roomId Unique string identifying the room.
 */
Chatter.removeUserFromRoom = function (params) {
  check(params, {
    userId: String,
    roomId: String
  });

  const {userId, roomId} = params;
  const user = Meteor.users.findOne(userId);
  const room = Chatter.Room.findOne(roomId);

  if (_.isEmpty(room)) {
    throw new Meteor.Error("room-does-not-exist", "room id provided is not correct");
  } else if (!user) {
    throw new Meteor.Error("user-does-not-exist", "user id provided is not correct");
  }

  const userRoom = Chatter.UserRoom.findOne({roomId, userId: user._id});

  if (_.isEmpty(userRoom)) {
    throw new Meteor.Error("user-has-not-been-added-to-room", "the user had not been added to room ");
  }

  return userRoom.remove();
};

/**
 * @summary Fetches the room given a reference ref.
 * @locus Server
 * @param {string} ref Unique string identifying room.
 */
Chatter.getRoomId = function (ref) {
  check(ref, String);
  const room = Chatter.Room.findOne({ref});
  return _.isEmpty(room) ? null : room._id;
};

export default Chatter;
