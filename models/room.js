import { Class } from 'meteor/jagi:astronomy';

Chatter.Room = ChatterRoom = Class.create({
  name: "ChatterRoom",
  collection: new Mongo.Collection("chatterroom"),

  fields: {
    name: {
      type: String,
      validators: [{
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
      optional: true,
      default: function () {
        return "default";
      }
    },

    ref: {
      type: String,
      optional: true
    },

    lastActive: {
      type: Date,
      optional: true,
      default: function () {
        return (new Date());
      }
    },

    lastMessage: {
      type: String,
      optional: true,
      default: function () {
        return null;
      }
    },

    lastMessageOwner: {
      type: String,
      optional: true,
      default: function () {
        return null;
      }
    },

    createdBy: {
      type: String,
      optional: true
    }
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

  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
      hasUpdatedField: true,
      updatedFieldName: 'updatedAt'
    }
  }
});
