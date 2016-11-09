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
  if (!this.userId) return;

  // Only interested in sending rooms that the user has joined
  const userRooms = Chatter.UserRoom.find({userId: this.userId}).fetch();
  const roomIds =  _.pluck(userRooms, "roomId");

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
  return ChatterUserRoom.find({
  }, {
    fields: {
      unreadMsgCount: 1,
      userId: 1,
      roomId: 1,
      archived: 1
    }
  });
});

Meteor.publish("users", function (roomId) {

  // Only interested in sending the rooms belonging to same class
  return Meteor.users.find({
  }, {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      status: 1
    }
  });
});
