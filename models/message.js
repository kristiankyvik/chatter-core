const reqStrNotNull = Validators.and([
  Validators.required(),
  Validators.string(),
  Validators.notNull()
]);


const cascadeUpdate = function (message) {
  if (Meteor.isServer) {
    // This increases the ammount of unread messages for all users
    // that have joined the room
    const userRoomIds = _.pluck(Chatter.UserRoom.find({"roomId": message.roomId, "userId": {$nin: [message.userId]}}).fetch(), "_id");

    // Performs update via bulk update if moe than 10 items wll be updated.
    if (userRoomIds > 10 ) {
      var bulkOp = Chatter.UserRoom.getCollection().rawCollection().initializeUnorderedBulkOp();
      _.forEach(userRoomIds, function (userRoomId) {
        bulkOp.find({_id: userRoomId}).update({$inc: {unreadMsgCount: 1}});
      });
      bulkOp.execute(function (e, r) {
        console.info('r.nMatched', r.nMatched, 'r.nModified', r.nModified);
      });
    } else {
      Chatter.UserRoom.update({_id: {$in: userRoomIds}, roomId: message.roomId}, {$inc: {unreadMsgCount: 1} }, {multi: true});
    }

    // This updates the lastActive attribute of the room,
    // to be used after new messages have been posted to the room
    Chatter.Room.update({
      _id: message.roomId
    },
    { $set: {lastActive: new Date()} }
    );
  }
};

Chatter.Message = ChatterMessage = Astro.Class({
  name: "ChatterMessage",
  collection: new Mongo.Collection("chattermessage"),

  fields: {
    userId: {
      type: "string",
      index: 1,
      validator: [
        reqStrNotNull
      ]
    },

    roomId: {
      type: "string",
      index: 1,
      validator: [
        reqStrNotNull
      ]
    },

    message: {
      type: "string",
      validator: [
        Validators.minLength(1, 'The message must not be empty!'),
        Validators.maxLength(1000),
        reqStrNotNull
      ]
    }
  },

  events: {
    afterSave: function () {
      cascadeUpdate(this);
    }
  },

  methods: {
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


