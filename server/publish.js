Meteor.publish("chatterMessages", function (params) {
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

Meteor.publishComposite('widgetData', function () {
  console.log("subbed to widgetData");
  if (_.isEmpty(this.userId)) return this.ready();

  Counts.publish(this, 'widgetCounter', Chatter.UserRoom.find({userId: this.userId, unreadMsgCount: { $gt: 0 }}));
});

Meteor.publishComposite('roomData', function (roomId) {
  console.log("subbed to roomData");
  if (_.isEmpty(this.userId)) return this.ready();

  return {
    find: function () {
      // Find the current user's rooms
      return Chatter.UserRoom.find({ roomId },
        {
          fields: {
            userId: 1,
            roomId: 1
          },
          sort: {createdAt: 1}
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
                status: 1
              }
            }
          );
        }
      },
      {
        find: function (userRoom) {
          return Chatter.Room.find({_id: userRoom.roomId},
            {
              limit: 1,
              fields: {
                name: 1,
                description: 1,
                roomType: 1,
                lastActive: 1,
                archived: 1,
                createdAt: 1
              }
            }
          );
        }
      }
    ]
  };
});


Meteor.publishComposite('roomListData', function (params) {
  console.log("subbed to roomlistdata");

  const filter = {
    fields: {
      unreadMsgCount: 1,
      userId: 1,
      roomId: 1,
      archived: 1
    }
  };

  if (!_.isNull(params.roomLimit)) {
    filter.limit = params.roomLimit;
  }

  return {
    find: function () {
      // Find the current user's rooms
      return Chatter.UserRoom.find({ userId: params.userId },
        filter
      );
    },
    children: [
      {
        find: function (userRoom) {
          return Chatter.Room.find({_id: userRoom.roomId},
            {
              fields: {
                name: 1,
                description: 1,
                roomType: 1,
                lastActive: 1,
                archived: 1
              },
              sort: {lastActive: -1}
            }
          );
        },
        children: [{
          find: function (room) {
            return Chatter.Message.find({roomId: room._id},
              {
                limit: 1,
                fields: {
                  message: 1,
                  roomId: 1,
                  nickname: 1,
                  userId: 1,
                  createdAt: 1
                },
                sort: {createdAt: -1}
              }
            );
          },
          children: [{
            find: function (message) {
              return Meteor.users.find({_id: message.userId},
                {
                  limit: 1,
                  fields: {
                    "status.online": 1
                  }
                }
              );
            }
          }]
        }]
      }
    ]
  };
});

Meteor.publishComposite('addUsers', function () {
  console.log("subbed to addUsersData");
  if (_.isEmpty(this.userId)) return this.ready();

  return {
    find: function () {
      return Chatter.UserRoom.find({},
        {
          limit: 5,
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
              iimit: 5,
              fields: {
                _id: 1,
                username: 1,
                profile: 1,
                status: 1
              }
            }
          );
        }
      }
    ]
  };
});
