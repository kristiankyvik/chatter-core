import {userInRoom, checkIfChatterUser, capitalize} from "../utils.js";

Meteor.methods({

  "get.room.unreadMsgCount" () {
    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const userRooms = Chatter.UserRoom.find({userId}).fetch();
    const roomIds = userRooms.map(function(userRoom) {return userRoom.roomId});
    const rooms = Chatter.Room.find({"_id": {$in: roomIds}})

    const response = {
      archivedCount: 0,
      activeCount: 0
    };

    rooms.forEach(function(room){
      room.archived ? response.archivedCount += 1 : response.activeCount += 1;
    });

    return response;
  },

  "room.create" (params) {
    check(params, {
        name: String,
        description: String
    });

    const {name, description} = params;
    const userId =  Meteor.userId();

    checkIfChatterUser(userId);

    const user = Meteor.users.findOne(userId);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    const room = new Chatter.Room({
      name,
      description,
      createdBy: userId
    })

    if (room.validate()) {
      const roomId = room.save();
      new Chatter.UserRoom({
        userId,
        roomId
      }).save();
      return roomId;
    }

    room.throwValidationException();
  },

  "room.check" (roomId) {
    check(roomId, String);

    const room = Chatter.Room.findOne(roomId);
    return room;
  },

  "room.join" (params) {
    check(params, {
      roomId: String,
      invitees: [String]
    });

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const user = Meteor.users.findOne(userId);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    const room = Chatter.Room.findOne(params.roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    let userNotexists = false;
    _.each(params.invitees, function(userId) {

      let user = Meteor.users.findOne(userId);
      if (user) {
        Chatter.UserRoom.upsert({
          userId: userId,
          roomId: room._id
        }, {
          $set: {
            userId: userId,
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

  "room.leave" (params) {
    check(params, {
      userId: String,
      roomId: String
    });

    const userIdToRemove = params.userId;

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const user = Meteor.users.findOne(userId);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    Chatter.UserRoom.remove({
      userId: userIdToRemove,
      roomId: params.roomId
    });
  },

  "room.get" (id) {
    check(id, String);
    checkIfChatterUser(Meteor.userId());
    return Chatter.Room.findOne({
      _id : id
    });
  },

  "room.archive" (params) {
    check(params, {
        roomId: String,
        userId: String,
        archived: Boolean
    });

    const userId =  Meteor.userId();
    const {roomId, archived} = params;
    const userRoom = Chatter.UserRoom.findOne({roomId, userId});

    if (!userRoom) {
      throw new Meteor.Error("user-not-in-room", "user must be in room");
    }

    Chatter.UserRoom.update({
      roomId,
      userId
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
      return Meteor.users.findOne(userRoom.userId);
    });

    return users;
  },


  "user.changeNickname" (nickname) {
    check(nickname, String);

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);

    Meteor.users.update(
      userId,
    {
      $set:{"profile.chatterNickname": nickname}
    });

    return nickname;
  },

  "help.createRoom" () {
    const users = [];
    const user = Meteor.user();
    const userId =  user._id;

    checkIfChatterUser(userId);

    users.push(userId);

    const supportUser = Meteor.users.findOne({username: user.profile.supportUser});

    if (!supportUser) {
      throw new Meteor.Error("user-does-not-exist", "user does not exist");
    }

    users.push(supportUser._id);

    const room = new Chatter.Room({
      name: "Support Chat (" + capitalize(Meteor.user().username) + ")",
      description: "A room that gets you the help you need",
      createdBy: userId,
      roomType: "support",
      ref: user.username
    });

    if (room.validate()) {
      const roomId = room.save();
      users.forEach(function(user) {
        new Chatter.UserRoom({
          userId: user,
          roomId: roomId
        }).save();
      });
      return roomId;
    }

    room.throwValidationException();
  },

  "room.unreadMsgCount.reset" (roomId) {
    check(roomId, String);

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const user = Meteor.users.findOne(userId);
    const room = Chatter.Room.findOne(roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    if (!userInRoom(userId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be reset counter");
    }

    const userRoomId = Chatter.UserRoom.findOne({roomId, userId: userId})._id;

    Chatter.UserRoom.update({
      _id: userRoomId
    },
    {
      $set:{unreadMsgCount: 0}
    });

    return true
  },

  "room.delete" (roomId) {
    check(roomId, String);

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);

    const user = Meteor.users.findOne(userId);
    const room = Chatter.Room.findOne(roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    const userRooms = Chatter.UserRoom.find({roomId}).fetch();

    room.remove(function(error, result) {
      if (error) throw new Meteor.Error("remove-room-error", "room was not deleted");

      userRooms.forEach(function(userRoom) {
        userRoom.remove(function(error, result) {
          if (error) throw new Meteor.Error("remove-userRoom-error", "userRoom was not deleted");
        });
      });

    });
    return roomId;
  }
});
