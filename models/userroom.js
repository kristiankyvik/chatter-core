Chatter.UserRoom = ChatterUserRoom = Astro.Class({
  name: "ChatterUserRoom",
  collection: new Mongo.Collection("chatteruserroom"),

  fields: {
    userId: {
      type: "string"
    },

    roomId: {
      type: "string"
    },

    unreadMsgCount: {
      type: "number",
      default: function () {
        return 0;
      }
    },

    lastActive: {
      type: "date",
      default: function () {
        return (new Date());
      }
    },

    archived: {
      type: "boolean",
      default: function () {
        return false;
      }
    },
  },

  indexes: {
    userRoomIndex: {
      fields: {
        roomId: -1,
        userId: 1,
        lastActive: -1
      },
      options: {}
    }
  },

  validators: {

  },

  events: {

  },

  methods: {

  },

  behaviors: ["timestamp"]
});
