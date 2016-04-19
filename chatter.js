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
 * @param {string} userId Unique string identifying the users of your application.
 * @param {string} userType Defines the restricitons on the new user. Can either be set to "admin" or "standard".
 * @returns {string} userId
 */
Chatter.addUser = function(userId, userType) {
  check(userId, String);
  check(userType, Match.Maybe(String));
    const user = Meteor.users.findOne({_id: userId});
    return Chatter.User.upsert({
        userId: userId
    }, {
        $set: {
          userType: userType,
          nickname: getNickname(user)
        }
    });
};

/**
 * @summary Adds empty room to Chatter.
 * @locus Server
 * @param {string} rommName
 * @returns {string} roomId
 */
Chatter.addRoom = function(roomName) {
    check(roomName, String);
    return Chatter.Room.insert({name: roomName});
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
