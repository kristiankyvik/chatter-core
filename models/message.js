import { Class } from 'meteor/jagi:astronomy';

const cascadeUpdate = function (message) {
  if (Meteor.isServer) {
    // This updates the lastActive attribute of the room,
    // to be used after new messages have been posted to the room
    Chatter.Room.update({
      _id: message.roomId
    },
    { $set: {lastActive: new Date(), lastMessage: message.message, lastMessageOwner: message.userId} }
    );
    // This increases the ammount of unread messages for all users
    // that have joined the room
    const userRoomIds = _.pluck(Chatter.UserRoom.find({"roomId": message.roomId, "userId": {$nin: [message.userId]}}).fetch(), "_id");

    // Performs update via bulk update if moe than 10 items wll be updated.
    if (userRoomIds.length > 1 ) {
      var bulkOp = Chatter.UserRoom.getCollection().rawCollection().initializeUnorderedBulkOp();
      _.forEach(userRoomIds, function (userRoomId) {
        bulkOp.find({_id: userRoomId}).update({$set: {lastActive: new Date()}, $inc: {unreadMsgCount: 1}});
      });
      bulkOp.execute(function (e, r) {
      });
    } else {
      Chatter.UserRoom.update({_id: {$in: userRoomIds}}, {$set: {lastActive: new Date()}, $inc: {unreadMsgCount: 1} }, {multi: true});
    }
  }
};

Chatter.Message = ChatterMessage = Class.create({
  name: "ChatterMessage",
  collection: new Mongo.Collection("chattermessage"),

  fields: {
    userId: {
      type: String,
      validators: [{
        type: "required"
      }, {
        type: "string"
      }, {
        type: "notNull"
      }]
    },

    roomId: {
      type: String,
      validators: [{
        type: "required"
      }, {
        type: "string"
      }, {
        type: "notNull"
      }]
    },

    message: {
      type: String,
      validators: [{
        type: "required"
      }, {
        type: "string"
      }, {
        type: "notNull"
      },
      {
        type: "minLength",
        param: 1,
        message: "The message must not be empty!"
      },
      {
        type: 'maxLength',
        param: 1000
      }]
    }
  },

  indexes: {
    sortIndex: {
      fields: {
        createdAt: -1
      },
      options: {}
    },
    hashedIndex: {
      fields: {
        roomId: "hashed"
      },
      options: {}
    }
  },

  events: {
    afterSave: function () {
      cascadeUpdate(this);
    }
  },

  helpers: {
    getTimeAgo: function () {
      return moment(this.get("createdAt")).fromNow();
    },
    getMinutesAgo: function () {
      const now = moment(new Date());
      const then = this.get("createdAt");
      const duration = moment.duration(now.diff(then)).asMinutes();
      return duration;
    },
    getDate: function () {
      const date = moment(this.get("createdAt"));
      const iscurrentDate = date.isSame(new Date(), "day");
      const res = iscurrentDate ? "Today" : date.format("MMMM Do");
      return res;
    }
  },

  behaviors: ["timestamp"]
});


