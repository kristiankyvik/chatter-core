const getChatterId = function(userId) {
  return Chatter.User.findOne({userId: this.userId})._id;
};

Meteor.methods({
  "user.check" () {
    const chatterUsers = Chatter.User.find({userId: this.userId}).fetch();
    return chatterUsers.length > 0;
  },

  "message.build" (params) {
    check(params, {
          message: String,
          roomId: String
    });
    return new Chatter.Message({
        message: params.message,
        roomId: params.roomId,
        userId: getChatterId(this.userId)
    }).save();
  },

  "userroom.build" (form) {
    check(form, {
        name: String,
        roomId: String,
        invitees: [String]
    });

    const room = Chatter.Room.findOne({_id: form.roomId});

    if (room === undefined) {
        return "room does not exist";
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
    return userNotexists ? "user does not exist" : Chatter.UserRoom.findOne()._id;
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

    return Chatte<r.UserRoom.update({
        roomId: roomId,
        userId: getChatterId(this.userId)
    },
    {
        $set:{count: 0}
    });
  }
});
