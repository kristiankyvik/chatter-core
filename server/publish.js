import {checkIfChatterUser} from "../utils.js";

Meteor.publish("chatterMessages", function (params) {
  check(params, {
    messageLimit: Number
  });
  if (_.isEmpty(this.userId)) return;

  checkIfChatterUser(this.userId);

  // Only interested in sending messages from rooms the user is part of
  const userRooms = Chatter.UserRoom.find({userId: this.userId}).fetch();
  const roomIds = _.pluck(userRooms, "roomId");

  return ChatterMessage.find({
    roomId: {$in: roomIds}
  }, {
    limit: params.messageLimit,
    fields: {
      message: 1,
      roomId: 1,
      nickname: 1,
      avatar: 1,
      userId: 1,
      createdAt: 1
    },
    sort: {createdAt: -1}
  });
});

Meteor.publish("chatterRooms", function (roomIds) {
  if (_.isEmpty(this.userId)) return;

  checkIfChatterUser(this.userId);

  // Only interested in sending rooms that the user has joined
  const userRooms = Chatter.UserRoom.find({userId: this.userId}).fetch();
  const theroomids = _.isEmpty(roomIds) ? _.pluck(userRooms, "roomId") : roomIds;

  return ChatterRoom.find({
    "_id": {$in: theroomids}
  }, {
    fields: {
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1,
      createdAt: 1
    }
  });
});

Meteor.publish("chatterUserRooms", function () {
  // If not admin, only interested in sending userRooms belonging to the user
  if (_.isEmpty(this.userId)) return;

  checkIfChatterUser(this.userId);

  const isAdmin = Meteor.users.findOne(this.userId).profile.isChatterAdmin;
  const selector = {};

  if (!isAdmin) {
    selector.userId = this.userId;
  }

  return ChatterUserRoom.find(
    selector
  , {
    fields: {
      unreadMsgCount: 1,
      userId: 1,
      roomId: 1,
      archived: 1
    }
  });
});

Meteor.publish("users", function () {
  if (_.isEmpty(this.userId)) return;

  checkIfChatterUser(this.userId);

  const selector = {};
  const isAdmin = Meteor.users.findOne(this.userId).profile.isChatterAdmin;

  // only sends users that are in rooms where the subscribing user has joined
  const roomUserIsPartOf = Chatter.UserRoom.find({userId: this.userId}).fetch();
  const roomIdsUserIsPartOf = _.pluck(roomUserIsPartOf, "roomId");
  const userRooms = Chatter.UserRoom.find({"roomId": {$in: roomIdsUserIsPartOf}}).fetch();
  const userIds = _.pluck(userRooms, "userId");

  if (!isAdmin) {
    selector._id = {"$in": userIds};
  }

  // TODO: Limit ammount of users bieng sent to the client, especially if admin!
  return Meteor.users.find(
    selector
  , {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      status: 1
    }
  });
});
