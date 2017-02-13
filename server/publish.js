import PublishRelations from 'meteor/cottz:publish-relations';


Meteor.publish("chatterMessages", function (params) {
  this.unblock();
  console.log("subbed to chatterMessages");
  check(params, {
    messageLimit: Number,
    roomId: String
  });

  if (_.isEmpty(this.userId)) return this.ready();

  const roomId = params.roomId;

  return ChatterMessage.find({
    roomId
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
    // Sending only new messages
    sort: {createdAt: -1}
  });
});

Meteor.publish('widgetData', function () {
  this.unblock();
  console.log("subbed to widgetData");
  if (_.isEmpty(this.userId)) return this.ready();
  Counts.publish(this, 'widgetCounter', Chatter.UserRoom.find({userId: this.userId, unreadMsgCount: { $gt: 0 }}));
});

PublishRelations('roomData', function (roomId) {
  this.unblock();
  console.log("subbed to roomData");
  if (_.isEmpty(this.userId)) return this.ready();

  const roomFilter = {
    fields: {
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1,
      createdAt: 1
    }
  };

  const userFilter = {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      "status.online": 1
    }
  };

  const userRoomFilter = {
    fields: {
      roomId: 1,
      userId: 1,
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1,
      createdAt: 1
    }
  };

  let rooms = this.join(Chatter.Room, roomFilter);
  let users = this.join(Meteor.users, userFilter);

  this.cursor(Chatter.UserRoom.find({ roomId }, userRoomFilter), function (id, userRoom) {
    users.push(userRoom.userId);
    rooms.push(userRoom.roomId);
  });

  users.send();
  rooms.send();
  return this.ready();
});

PublishRelations('roomListData', function (params) {
  this.unblock();
  console.log("subbed to roomlistdata");

  if (_.isEmpty(this.userId)) return this.ready();

  const userRoomFilter = {
    fields: {
      unreadMsgCount: 1,
      userId: 1,
      roomId: 1,
      archived: 1
    },
    // This will prioritize sending userRooms that have changed recently
    sort: {lastActive: -1}
  };

  if (!_.isNull(params.roomLimit)) {
    userRoomFilter.limit = params.roomLimit;
  }

  const roomFilter = {
    limit: 1,
    fields: {
      _id: 1,
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1
    }
  };

  const messageFilter = {
    limit: 1,
    fields: {
      message: 1,
      roomId: 1,
      nickname: 1,
      userId: 1,
      createdAt: 1
    },
    sort: {createdAt: -1}
  };

  const userFilter = {
    limit: 1,
    fields: {
      "status.online": 1
    }
  };

  this.cursor(Chatter.UserRoom.find({ userId: params.userId }, userRoomFilter), function (id, userRoom) {
    this.cursor(Chatter.Room.find({_id: userRoom.roomId}, roomFilter), function (id, room) {
      this.cursor(Chatter.Message.find({roomId: id}, messageFilter), function (id, message) {
        this.cursor(Meteor.users.find({_id: message.userId}, userFilter), function (id, user) {
        });
      });
    });
  });
  return this.ready();
});

Meteor.publish('addUsersSearch', function (query) {
  this.unblock();
  console.log("subbed to addUserSearch");

  if (_.isEmpty(query)) {
    return this.ready();
  }

  const regex = new RegExp(".*" + query + ".*", "i"); // 'i' for case insensitive search

  return Meteor.users.find({
    username: {$regex: regex}
  }, {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      "status.online": 1
    },
    // Sending only new messages
    sort: {createdAt: -1}
  });
});

Meteor.publishComposite('addUsers', function (roomId) {
  this.unblock();
  console.log("subbed to addUsersData");
  if (_.isEmpty(this.userId)) return this.ready();

  return {
    find: function () {
      return Chatter.UserRoom.find({roomId},
        {
          fields: {
            userId: 1,
            roomId: 1
          }
        }
      );
    },
    children: [
      {
        find: function (userRoom) {
          return Meteor.users.find({_id: userRoom.userId},
            {
              fields: {
                _id: 1,
                username: 1,
                profile: 1,
                "status.online": 1
              }
            }
          );
        }
      }
    ]
  };
});
