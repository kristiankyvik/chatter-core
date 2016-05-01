const getChatterId = function(userId) {
  return Chatter.User.findOne({userId: userId})._id;
};

const userInRoom = function(chatterId, roomId) {
  const userRooms = Chatter.UserRoom.find({userId: chatterId, roomId}).fetch();
  return userRooms.length > 0;
};


Meteor.methods({
  "user.check" () {
    const chatterUsers = Chatter.User.find({userId: Meteor.userId()}).fetch();
    return chatterUsers.length > 0 ;
  },

  "message.build" (params) {
    check(params, {
      message: String,
      roomId: String
    });

    const chatterId = getChatterId(Meteor.userId());

    if (!userInRoom(chatterId, params.roomId)) {
      throw new Meteor.Error('user-not-in-room', 'user must be in room to post messages');
    }

    const message = new Chatter.Message({
      message: params.message,
      roomId: params.roomId,
      userId: chatterId
    });

    if (message.validate()) {
      return message.save();
    }

    message.throwValidationException();
  },

  "userroom.build" (form) {
    check(form, {
      name: String,
      roomId: String,
      invitees: [String]
    });

    const room = Chatter.Room.findOne({_id: form.roomId});

    if (room === undefined) {
      throw new Meteor.Error('non-existing-room', "room does not exist");
    }
    let userNotexists = false;
    _.each(form.invitees, function(chatterUserId) {
      let user = Chatter.User.find({_id: chatterUserId}).fetch();
      if (user.length > 0) {
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

  "room.build" (form) {
  check(form, {
      name: String,
      description: String
    });
    return new Chatter.Room({
      name: form.name,
      description: form.description
    }).save();
  },

  "room.get" (id) {
    check(id, String);
    return Chatter.Room.findOne({
      _id : id
    });
  },

  "room.archive" (roomId, archived) {
    check(roomId, String);
    check(archived, Boolean);
    return Chatter.Room.update({
      _id : roomId
    },
    {
      $set:{archived: archived}
    });
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
    return Chatter.UserRoom.update({
      roomId: roomId,
      userId: getChatterId(Meteor.userId())
    },
    {
      $set:{count: 0}
    });
  }
});
