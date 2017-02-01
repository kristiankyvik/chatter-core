import {userInRoom, checkIfChatterUser, capitalize} from "../utils.js";

Meteor.methods({

  "user.changeNickname" (nickname) {
    check(nickname, String);

    const userId = Meteor.userId();
    checkIfChatterUser(userId);

    // only allow to update nickname if editableNickname has been set to true

    if(!Chatter.options.editableNickname) {
      throw new Meteor.Error("nicknames-not-editable", "nickname are non editable");
    }

    Meteor.users.update(
      userId,
    { $set: { "profile.chatterNickname": nickname } });

    return nickname;
  },

  "room.create" (params) {
    check(params, {
      name: String,
      description: String
    });

    const user = Meteor.user();
    checkIfChatterUser(user);

    const {name, description} = params;
    const userId = user._id;

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to create rooms");
    }

    const room = new Chatter.Room({
      name,
      description,
      createdBy: userId
    });

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

  "room.delete" (roomId) {
    check(roomId, String);

    const user = Meteor.user();

    checkIfChatterUser(user);

    const userId = user._id;
    const room = Chatter.Room.find({_id: roomId}, {fields: {roomType: 1}, limit: 1});

    if (_.isEmpty(room)) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    const isSupportRoom = room.roomType === "support" ? true : false;

    if (!isSupportRoom && !user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to delete rooms");
    }

    const userRoomCount = Chatter.UserRoom.find({roomId, userId}, {fields: {_id: 1}, limit: 1}).count();

    if (!user.profile.isChatterAdmin && userRoomCount === 0) {
      throw new Meteor.Error("user-not-in-support-room", "user must have joined support room to delete it");
    }

    const userRooms = Chatter.UserRoom.find({roomId}).fetch();

    room.remove(function (error, result) {
      if (error) throw new Meteor.Error("remove-room-error", "room was not deleted");
      userRooms.forEach(function (userRoom) {
        userRoom.remove(function (error, result) {
          if (error) throw new Meteor.Error("remove-userRoom-error", "userRoom was not deleted");
        });
      });
    });

    return roomId;
  },

  "room.check" (roomId) {
    check(roomId, String);
    const count = Chatter.Room.find({_id: roomId}, {fields: {_id: 1}, limit: 1}).count();
    return count > 0;
  },

  "room.join" (params) {
    check(params, {
      roomId: String,
      invitees: [String]
    });

    const user = Meteor.user();
    checkIfChatterUser(user);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to invite users");
    }

    const rooms = Chatter.Room.find({_id: params.roomId}, {fields: {_id: 1}, limit: 1});

    if (rooms.count() === 0) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    const roomId = rooms.fetch()[0]._id;

    let userNotexists = false;
    _.each(params.invitees, function (id) {
      let checkUser = Meteor.users.find({_id: id}, {fields: {_id: 1}, limit: 1}).count();
      if (checkUser > 0) {
        Chatter.UserRoom.upsert({
          userId: id,
          roomId: roomId
        }, {
          $set: {
            userId: id,
            roomId: roomId
          }
        });
      } else {
        userNotexists = true;
      }
    });

    if (userNotexists) {
      throw new Meteor.Error("non-existing-user", "user does not exist");
    }

    return roomId;
  },

  "room.leave" (params) {
    check(params, {
      userId: String,
      roomId: String
    });

    const user = Meteor.user();
    checkIfChatterUser(user);

    const userIdToRemove = params.userId;

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    Chatter.UserRoom.remove({
      userId: userIdToRemove,
      roomId: params.roomId
    });

    return params.roomId;
  },

  "room.get" (id) {
    check(id, String);
    checkIfChatterUser(Meteor.userId());
    return Chatter.Room.findOne(id);
  },

  "room.archive" (params) {
    this.unblock();
    check(params, {
      roomId: String,
      userId: String,
      archived: Boolean
    });

    const user = Meteor.user();
    checkIfChatterUser(user);
    const userId = user._id;

    const {roomId, archived} = params;

    const userRoom = Chatter.UserRoom.find({roomId, userId}, {fields: {_id: 1}, limit: 1}).count();

    if (userRoom === 0) {
      throw new Meteor.Error("user-not-in-room", "user must be in room");
    }

    Chatter.UserRoom.update({
      roomId,
      userId
    },
    { $set: { archived: archived} });
    return archived;
  },

  "room.getUnreadMsgCount" () {
    const user = Meteor.user();
    checkIfChatterUser(user);
    const userId = user._id;

    const userRooms = Chatter.UserRoom.find({userId}, {fields: {roomId: 1}}).fetch();

    const roomIds = _.pluck(userRooms, "roomId");

    const archivedCount = Chatter.Room.find({"_id": {$in: roomIds}, archived: true}, {fields: {_id: 1}}).count();
    const activeCount = Chatter.Room.find({"_id": {$in: roomIds}, archived: false}, {fields: {_id: 1}}).count();

    const response = {
      archivedCount,
      activeCount
    };

    return response;
  },

  "room.unreadMsgCount.reset" (roomId) {
    this.unblock();
    check(roomId, String);

    const user = Meteor.user();
    checkIfChatterUser(user);
    const userId = user._id;

    const room = Chatter.Room.find({_id: roomId}, {fields: {_id: 1}, limit: 1}).count();

    if (room === 0) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    if (!userInRoom(userId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be reset counter");
    }

    const userRoomId = Chatter.UserRoom.find({roomId, userId: userId}, {limit: 1, fields: {_id: 1}}).fetch()[0]._id;

    Chatter.UserRoom.update({
      _id: userRoomId
    },
    { $set: {unreadMsgCount: 0} });

    return true;
  },

  "help.createRoom" () {
    this.unblock();
    const user = Meteor.user();
    checkIfChatterUser(user);
    const userId = user._id;

    const users = [];

    users.push(userId);

    if (!_.has(user.profile, "supportUser")) {
      throw new Meteor.Error("user-has-no-support-user", "user has no support user");
    }

    const supportUser = Meteor.users.find({username: user.profile.supportUser}, {fields: {_id: 1}, limit: 1});

    if (supportUser.count() === 0) {
      throw new Meteor.Error("user-does-not-exist", "user does not exist");
    }

    users.push(supportUser.fetch()[0]._id);

    const room = new Chatter.Room({
      name: "Support Chat (" + capitalize(user.username) + ")",
      description: "A room that gets you the help you need",
      createdBy: userId,
      roomType: "support",
      ref: user.username
    });

    if (room.validate()) {
      const roomId = room.save();
      users.forEach(function (id) {
        new Chatter.UserRoom({
          userId: id,
          roomId: roomId
        }).save();
      });
      return roomId;
    }

    room.throwValidationException();
  },

  "message.count" (roomId) {
    this.unblock();
    check(roomId, String);

    const user = Meteor.user();
    checkIfChatterUser(user);

    const room = Chatter.Room.find({roomId}, {fields: {_id: 1}, limit: 1}).count();

    if (room === 0) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    const count = Chatter.Message.find({roomId}).count();

    return count;
  }

});
