import {userInRoom, checkIfChatterUser, capitalize} from "../utils.js";
import Chatter from '../chatter.js';

Meteor.methods({

  "user.changeNickname" (nickname) {
    check(nickname, String);

    const user = Meteor.user();

    checkIfChatterUser(user);

    // only allow to update nickname if editableNickname has been set to true

    if(!Chatter.options.editableNickname) {
      throw new Meteor.Error("nicknames-not-editable", "nickname are non editable");
    }

    Meteor.users.update(
      user._id,
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

    let res;
    res = room.save();
    new Chatter.UserRoom({
      userId,
      roomId: res
    }).save();

    return res;
  },

  "room.delete" (roomId) {
    check(roomId, String);

    const user = Meteor.user();

    checkIfChatterUser(user);

    const userId = user._id;
    const roomCursor = Chatter.Room.find({_id: roomId}, {fields: {deletable: 1}, limit: 1});

    if (roomCursor.count() === 0) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    const room = roomCursor.fetch()[0];

    if (!room.deletable && !user.profile.isChatterAdmin) {
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
    checkIfChatterUser(Meteor.user());
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

  "room.getCount" () {
    const user = Meteor.user();
    checkIfChatterUser(user);
    const userId = user._id;
    const roomCount = Chatter.UserRoom.find({userId}, {fields: {_id: 1}}).count();
    return {roomCount};
  },

  "rooms.unseen.reset" () {
    const user = Meteor.user();
    checkIfChatterUser(user);
    const userId = user._id;

    Chatter.UserRoom.update({
      userId,
      seen: false
    },
    { $set: {seen: true} });

    return true;
  },

  "room.unreadMsgCount.reset" (roomId) {
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

    if (!_.has(user.profile, "supportUser")) {
      throw new Meteor.Error("user-has-no-support-user", "user has no support user");
    }

    const query = {};
    query[Chatter.options.supportUserReference] = user.profile.supportUser;
    const supportUser = Meteor.users.find(query, {fields: {_id: 1}, limit: 1});

    if (supportUser.count() === 0) {
      throw new Meteor.Error("user-does-not-exist", "user does not exist");
    }

    const supportUserId = supportUser.fetch()[0]._id;
    const room = new Chatter.Room({
      name: "Support Chat",
      description: "A room that gets you the help you need",
      createdBy: userId,
      roomType: "support",
      ref: userId,
      deletable: true
    });

    const res = room.save();
    new Chatter.UserRoom({
      userId,
      roomId: res
    }).save();

    new Chatter.UserRoom({
      userId: supportUserId,
      roomId: res
    }).save();

    return res;
  },

  "message.count" (roomId) {
    check(roomId, String);

    const user = Meteor.user();
    checkIfChatterUser(user);

    const room = Chatter.Room.find({_id: roomId}, {fields: {_id: 1}, limit: 1}).count();

    if (room === 0) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    const count = Chatter.Message.find({roomId}).count();

    return count;
  }
});
