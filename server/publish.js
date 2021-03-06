import Chatter  from '../chatter.js';
import PublishRelations from "meteor/cottz:publish-relations";
import { Counts } from "meteor/tmeasday:publish-counts";

Meteor.publish("chatterMessages", function (params) {
  this.unblock();
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
  if (_.isEmpty(this.userId)) return this.ready();
  Counts.publish(this, 'unreadMsgCounter', Chatter.UserRoom.find({userId: this.userId, unreadMsgCount: { $gt: 0 }}));
  Counts.publish(this, 'unseenRoomsCounter', Chatter.UserRoom.find({userId: this.userId, seen: false}));
});

PublishRelations('roomData', function (roomId) {
  this.unblock();
  check(roomId, String);
  if (_.isEmpty(this.userId)) return this.ready();

  const roomFilter = {
    fields: {
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1,
      createdAt: 1,
      deletable: 1
    }
  };

  const userFilter = {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      "status.online": 1,
      supportUser: 1
    }
  };

  const userRoomFilter = {
    fields: {
      roomId: 1,
      userId: 1,
      lastActive: 1,
      createdAt: 1
    }
  };

  let users = this.join(Meteor.users, userFilter);
  this.cursor(Chatter.Room.find({ _id: roomId }, roomFilter), function (id, room, changed, added) {
    if (!changed) {
      this.cursor(Chatter.UserRoom.find({ roomId }, userRoomFilter), function (id, userRoom) {
        users.push(userRoom.userId);
      });
    }
  });
  users.send();
  return this.ready();
});

Meteor.publishComposite('roomListData', function (params) {
  this.unblock();
  check(params, {
    roomLimit: Number
  });

  if (_.isEmpty(this.userId)) return this.ready();

  const filter = {

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
    filter.limit = params.roomLimit;
  }

  return {
    find: function () {
      // Find the current user's rooms
      return Chatter.UserRoom.find({ userId: this.userId },
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
                lastMessage: 1,
                lastMessageOwner: 1,
                archived: 1,
                deletable: 1
              }
            }
          );
        },
        children: [{
          find: function (room) {
            return Meteor.users.find({_id: room.lastMessageOwner},
              {
                limit: 1,
                fields: {
                  profile: 1,
                  "status.online": 1
                }
              }
            );
          }
        }]
      }
    ]
  };
});

Meteor.publish('addUsersSearch', function (query) {
  this.unblock();

  if (_.isEmpty(query)) {
    return this.ready();
  }

  const regex = new RegExp(".*" + query + ".*", "i"); // 'i' for case insensitive search

  return Meteor.users.find({
    "profile.chatterNickname": {$regex: regex}
  }, {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      "status.online": 1
    }
  });
});

PublishRelations('addUsers', function (roomId) {
  this.unblock();

  if (_.isEmpty(this.userId)) return this.ready();

  const userFilter = {
    fields: {
      _id: 1,
      username: 1,
      userId: 1,
      profile: 1,
      "status.online": 1
    }
  };

  const userRoomFilter = {
    fields: {
      userId: 1,
      roomId: 1
    }
  };

  let users = this.join(Meteor.users, userFilter);
  this.cursor(Chatter.UserRoom.find({ roomId }, userRoomFilter), function (id, userRoom) {
    users.push(userRoom.userId);
  });

  users.send();
  return this.ready();
});

