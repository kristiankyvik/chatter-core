Chatter.UserRoomCount = ChatterUserRoomCount = Astro.Class({
    name: "ChatterUserRoomCount",
    collection: new Mongo.Collection("chatteruserroomcount"),

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

    events: {

    },

    methods: {

    },

    behaviors: ["timestamp"]
});
