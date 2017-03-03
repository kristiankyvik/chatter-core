import { Class } from 'meteor/jagi:astronomy';

Chatter.Room = ChatterRoom = Class.create({
  name: "ChatterRoom",
  collection: new Mongo.Collection("chatterroom"),

  fields: {
    name: {
      type: String,
      validators: [{
        type: "required"
      }, {
        type: "string"
      },
      {
        type: "minLength",
        param: 1
      }]
    },
    description: {
      type: String,
      validators: [{
        type: "required"
      }, {
        type: "string"
      },
      {
        type: "minLength",
        param: 1
      },
      {
        type: 'maxLength',
        param: 150
      }]
    },

    roomType: {
      type: String,
      default: function () {
        return "default";
      }
    },

    ref: {
      type: String
    },

    lastActive: {
      type: Date,
      default: function () {
        return (new Date());
      }
    },

    lastMessage: {
      type: String,
      default: function () {
        return null;
      }
    },

    lastMessageOwner: {
      type: String,
      default: function () {
        return null;
      }
    },

    createdBy: String
  },

  indexes: {
    hashedIndex: {
      fields: {
        ref: "hashed"
      },
      options: {}
    }
  },

  events: {

  },

  helpers: {
    getTimeAgo: function () {
      return moment(this.get("lastActive")).fromNow();
    }
  },

  behaviors: ["timestamp"]
});
