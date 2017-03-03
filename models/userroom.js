import { Class } from 'meteor/jagi:astronomy';

Chatter.UserRoom = ChatterUserRoom = Class.create({
  name: "ChatterUserRoom",
  collection: new Mongo.Collection("chatteruserroom"),

  fields: {
    userId: {
      type: String
    },

    roomId: {
      type: String
    },

    unreadMsgCount: {
      type: Number,
      default: function () {
        return 0;
      }
    },

    lastActive: {
      type: Date,
      default: function () {
        return (new Date());
      }
    },

    archived: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
  },

  indexes: {
    sortIndex: {
      fields: {
        lastActive: -1
      },
      options: {}
    },
    hashedIndexRoomId: {
      fields: {
        roomId: "hashed"
      },
      options: {
      }
    },
    hashedIndexUserId: {
      fields: {
        userId: "hashed"
      },
      options: {
      }
    }
  },

  validators: {

  },

  events: {

  },

  helpers: {

  },

  behaviors: ["timestamp"]
});
