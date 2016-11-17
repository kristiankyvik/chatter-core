const reqStrNotNull = Validators.and([
  Validators.required(),
  Validators.string(),
  Validators.notNull()
]);

// This function increases the ammount of unread messages for all users
// that have joined the room
const increaseCounter = function (message) {
  const userRooms = Chatter.UserRoom.find({"roomId": message.roomId, "userId": {$nin: [message.userId]}}).fetch();
  userRooms.map(function (userRoom) {
    Chatter.UserRoom.update({
      _id: userRoom._id,
    },
    { $inc: {unreadMsgCount: 1} });
  });
};

// This function updates the lastActive attribute of the room,
// to be used after new messages have been posted to the room
const updateRoom = function (roomId) {
  Chatter.Room.update({
    _id: roomId
  },
  { $set: {lastActive: new Date()} }
  );
};

Chatter.Message = ChatterMessage = Astro.Class({
  name: "ChatterMessage",
  collection: new Mongo.Collection("chattermessage"),

  fields: {
    userId: {
      type: "string",
      validator: [
        reqStrNotNull
      ]
    },

    roomId: {
      type: "string",
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
    beforeSave: function () {
      increaseCounter(this);
      updateRoom(this.roomId);
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


