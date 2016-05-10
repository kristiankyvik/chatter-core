const getChatterId = function(userId) {
  const chatterUser = Chatter.User.findOne({userId: userId});
  if (!chatterUser) {
    throw new Meteor.Error("unknown-user", "user has not been added to chatter");
  }
  return chatterUser._id;
};

const userInRoom = function(chatterId, roomId) {
  const userRooms = Chatter.UserRoom.find({userId: chatterId, roomId}).fetch();
  return userRooms.length > 0;
};


Meteor.methods({

  "user.check" () {
    const chatterUsers = Chatter.User.find({userId: Meteor.userId()}).fetch();
    return chatterUsers.length > 0;
  },

  "message.build" (params) {
    check(params, {
      message: String,
      roomId: String
    });

    const {message, roomId} = params;

    const chatterId = getChatterId(Meteor.userId());

    if (!userInRoom(chatterId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    const newMessage = new Chatter.Message({
      userId: chatterId
    });

    if (newMessage.validate()) {
      return message.save();
    }

    newMessage.throwValidationException();
  },

  "userroom.build" (form) {
    check(form, {
      roomId: String,
      invitees: [String]
    });

    const room = Chatter.Room.findOne({_id: form.roomId});

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }
    let userNotexists = false;
    _.each(form.invitees, function(chatterUserId) {
      let chatterUser = Chatter.User.findOne({_id: chatterUserId});
      if (chatterUser) {
        Chatter.UserRoom.upsert({
          userId: chatterUserId,
          roomId: room._id
        }, {
          $set: {
            userId: chatterUserId,
            roomId: room._id
          }
       });
      } else {
        userNotexists = true;
        return false;
      }
    })
    if (userNotexists) {
      throw new Meteor.Error("non-existing-users", "user does not exist");
    }
    return Chatter.UserRoom.findOne()._id;
  },

  "userroom.remove" (params) {
    check(params, {
      userId: String,
      roomId: String
    });

    Chatter.UserRoom.remove({
      userId: params.userId,
      roomId: params.roomId
    });
  },

  "room.build" (params) {
    check(params, {
        name: String,
        description: String
    });

    const {name, description} = params;

    const chatterId = getChatterId(Meteor.userId());

    const room = new Chatter.Room({
      name,
      description,
      createdBy: chatterId
    })

    if (room.validate()) {
      return room.save();
    }

    room.throwValidationException();
  },

  "room.get" (id) {
    check(id, String);
    return Chatter.Room.findOne({
      _id : id
    });
  },

  "room.archive" (params) {
    check(params, {
        roomId: String,
        archived: Boolean
    });

    const {roomId, archived} = params;

    const room = Chatter.Room.findOne({_id: roomId});
    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    Chatter.Room.update({
      _id : roomId
    },
    {
      $set:{archived: archived}
    });
    return archived;
  },

  "room.users" (roomId) {
    check(roomId, String);
    const userRooms = Chatter.UserRoom.find({"roomId": roomId}).fetch();
    const users = userRooms.map(function(userRoom) {
      const user = Chatter.User.findOne({_id: userRoom.userId });
      return user;
    });
    return users;
  },

  "userroom.count.reset" (roomId) {
    check(roomId, String);
    const chatterId = getChatterId(Meteor.userId());

    const room = Chatter.Room.findOne({_id: roomId});

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    if (!userInRoom(chatterId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    Chatter.UserRoom.update({
      roomId: roomId,
      userId: chatterId
    },
    {
      $set:{count: 0}
    });
    return true
  }
});
