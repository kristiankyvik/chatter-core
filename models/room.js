Chatter.Room = ChatterRoom = Astro.Class({
  name: "ChatterRoom",
  collection: new Mongo.Collection("chatterroom"),

  fields: {
    name: {
      type: "string",
      validator: [
        Validators.required(),
        Validators.minLength(1)
      ]
    },

    description: {
      type: "string",
      validator: [
        Validators.required(),
        Validators.minLength(1),
        Validators.maxLength(150)
      ]
    },

    roomType: {
      type: "string",
      default: function () {
        return "default";
      }
    },

    ref: {
      type: "string"
    },

    lastActive: {
      type: "date",
      default: function () {
        return (new Date());
      }
    },

    lastMessage: {
      type: "string",
      default: function () {
        return null;
      }
    },

    lastMessageOwner: {
      type: "string",
      default: function () {
        return null;
      }
    },

    createdBy: "string"
  },

  indexes: {
    roomIndex: {
      fields: {
        ref: 1
      },
      options: {}
    }
  },

  events: {

  },

  methods: {
    getTimeAgo: function () {
      return moment(this.get("lastActive")).fromNow();
    }
  },

  behaviors: ["timestamp"]
});
