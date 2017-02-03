import {checkIfChatterUser} from "../utils.js";

Meteor.publish("chatterMessages", function (params) {
  check(params, {
    messageLimit: Number,
    roomId: String
  });

  if (_.isEmpty(this.userId)) return;

  checkIfChatterUser(this.userId);

  const roomId = params.roomId;

  // Only interested in sending messages from rooms the user is part of
  const userRooms = Chatter.UserRoom.find({userId: this.userId}).fetch();
  const roomIds = _.pluck(userRooms, "roomId");
  if (roomIds.indexOf(roomId) < 0) return;

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
    sort: {createdAt: 1}
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
  if (_.isEmpty(this.userId)) return;

  checkIfChatterUser(this.userId);

  return ChatterUserRoom.find(
    {}
  , {
    fields: {
      unreadMsgCount: 1,
      userId: 1,
      roomId: 1,
      archived: 1
    }
  });
});

Meteor.publishComposite('roomData', function (userId) {
  return {
    find: function () {
      // Find the current user's rooms
      return Chatter.UserRoom.find({ userId },
        {
          fields: {
            unreadMsgCount: 1,
            userId: 1,
            roomId: 1,
            archived: 1
          }
        }
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
              }
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
                  avatar: 1,
                  userId: 1,
                  createdAt: 1
                },
                sort: {createdAt: 1}
              }
            );
          },
          children: [{
            find: function (message) {
              return Meteor.users.find({_id: message.userId},
                {
                  limit: 1,
                  fields: {
                    status: 1
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

