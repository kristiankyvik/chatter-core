Chatter.User = ChatterUser = Astro.Class({
  name: "ChatterUser",
  collection: new Mongo.Collection("chatteruser"),

  fields: {
    userType: {
      type: "string"
    },
    userId: {
      type: "string"
    },
    nickname: {
      type: "string"
    },
    avatar: {
      type: "string"
    }
  },

  validators: {

  },

  events: {
    afterInit: function() {
      var username = this.nickname;
      this.avatar =  `http://api.adorable.io/avatars/${username}`;
    }
  },

  methods: {

  },

  behaviors: ["timestamp"]
});
