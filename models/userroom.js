import { Class } from 'meteor/jagi:astronomy';
import Chatter  from '../chatter.js';

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
      optional: true,
      default: function () {
        return 0;
      }
    },

    lastActive: {
      type: Date,
      optional: true,
      default: function () {
        return (new Date());
      }
    },

    seen: {
      type: Boolean,
      optional: true,
      default: function () {
        return false;
      }
    },

    archived: {
      type: Boolean,
      optional: true,
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

  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
      hasUpdatedField: true,
      updatedFieldName: 'updatedAt'
    }
  }
});
