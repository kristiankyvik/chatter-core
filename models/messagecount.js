const reqStrNotNull = Validators.and([
  Validators.required(),
  Validators.string(),
  Validators.notNull()
]);

Chatter.MessageCount = ChatterMessageCount = Astro.Class({
  name: "ChatterMessageCount",
  collection: new Mongo.Collection("chattermessagecount"),

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

    count: {
      type: "number",
      default: function () {
        return 0;
      }
    }
  },

  events: {
  },

  methods: {

  },

  behaviors: ["timestamp"]
});

