Chatter.UserRoom = ChatterUserRoom = Astro.Class({
  name: "ChatterUserRoom",
  collection: new Mongo.Collection("chatteruserroom"),

  fields: {
    userId: {
      type: "string",
      index: 1
    },

    roomId: {
      type: "string",
      index: 1
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

  validators: {

  },

  events: {

  },

  methods: {

  },

  behaviors: ["timestamp"]
});
