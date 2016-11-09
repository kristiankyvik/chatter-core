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
