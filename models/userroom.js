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

    count: {
      type: "number",
      default: function() {
        return 0;
      }
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
