Meteor.publish("chatterMessages", function (opts) {
  check(opts, {
    roomId: String,
    messageLimit: Number
  });

  /*
  let room = ChatterRoom.findOne({ name: opts.roomName });
  if (_.isUndefined(room)) return [];
  // TODO Check for room restrictions here
  */

  return ChatterMessage.find({
    roomId: opts.roomId,
  }, {
    limit: opts.limit,
    fields: {
      message: 1,
      roomId: 1,
      userNick: 1,
      userAvatar: 1,
      userId: 1,
      createdAt: 1
    }
  });
});

Meteor.publish("chatterRooms", function () {
  let user = Meteor.users.findOne(this.userId);

  // TODO do some clever things here to determine
  // which rooms are accessible

  return ChatterRoom.find({
  }, {
    fields: {
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1,
      archived: 1,
      createdAt: 1
    }
  });
});

Meteor.publish("chatterUserRooms", function () {
  let user = Meteor.users.findOne(this.userId);

  // TODO do some clever things here to determine
  // which rooms are accessible

  return ChatterUserRoom.find({
  }, {
    fields: {
      count: 1,
      userId: 1,
      roomId: 1
    }
  });
});

Meteor.publish("users", function (roomId) {
  // TODO do some clever things here to determine
  // which users are visible
  return Meteor.users.find({
    "status.online": true
  }, {
    userNick: 1,
    avatar: 1
  });
});

Meteor.publish("chatterUsers", function () {
  // TODO do some clever things here to determine
  // which users are visible
  return Chatter.User.find({
  }, {
    _id: 1,
    userId: 1,
    userType: 1,
    nickname: 1
  });
});

