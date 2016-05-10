Chatter = {
  options: {
    messageLimit: 30,
    nickProperty: "username",
  }
};

Chatter.configure = function (opts) {
  _.extend(this.options, opts);
};

/**
 * @summary Adds user to Chatter and defines its privileges
 * @locus Server
 *
 * @param params Information about the new user.
 * @param {string} params.userId Meteor user id.
 * @param {string} params.userType Defines the restricitons on the new user. Can either be set to "admin" or "standard".
 * @returns {string} chatterId
 */
Chatter.addUser = function(params) {
  check(params, {
    userId: String,
    userType: Match.Maybe(String)
  });

  const users = Meteor.users.find({_id: params.userId}).fetch();

  if (users > 0) {
    throw new Meteor.Error("user-already-exists", "user has already been added to chatter");
  }

  const chatterUser = new Chatter.User({
    userId: params.userId,
    userType: userType,
    nickname: getNickname(user)
  })

  if (chatterUser.validate()) {
    return chatterUser.save();
  }

  chatterUser.throwValidationException();
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
    description: String
  });

  return new Chatter.Room({
    name: params.name,
    description: params.description,
  }).save();
};

/**
 * @summary Adds user to room.
 * @locus Server
 * @param {string} userId Unique string identifying user.
 * @param {string} roomName Unique string identifying the room.
 * @returns {string} userRoomId
 */
Chatter.addUserToRoom = function(userId, roomId) {
  check(userId, String);
  check(roomId, String);
  const chatterUserId = Chatter.User.findOne({userId: userId})._id;
  const room = Chatter.Room.findOne({_id: roomId});

  if (room === undefined || chatterUserId === undefined) {
    return "room or user does not exist";
  }

  return Chatter.UserRoom.upsert({
    userId: chatterUserId,
    roomId: room._id
  }, {
    $set: {
      userId: chatterUserId,
      roomId: room._id
    }
  });
};

function getNickname(user) {
  const nickPath = Chatter.options.nickProperty;
  const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);

  return nick;
}
