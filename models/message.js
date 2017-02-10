const reqStrNotNull = Validators.and([
  Validators.required(),
  Validators.string(),
  Validators.notNull()
]);


const cascadeUpdate = function (message) {
  if (Meteor.isServer) {
    // This increases the ammount of unread messages for all users
    // that have joined the room
    Chatter.UserRoom.update({userId: {$nin: [message.userId]}, roomId: message.roomId}, {$inc: {unreadMsgCount: 1} }, {multi: true});
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


