Meteor.publish("chatterMessages", function (params) {
  check(params, {
    roomId: String,
    messageLimit: Number
  });
  // Only interested in sending rooms that the user has joined
  return ChatterMessage.find({
    roomId: params.roomId
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

Meteor.publish("chatterRooms", function () {
  if (_.isUndefined(this.userId)) return;

  // Only interested in sending rooms that the user has joined
  const userRooms = Chatter.UserRoom.find({userId: this.userId}).fetch();
  const roomIds = _.pluck(userRooms, "roomId");

  return ChatterRoom.find({
    "_id": {$in: roomIds}
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
  if (_.isUndefined(this.userId)) return;
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
  if (_.isUndefined(this.userId)) return;
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
