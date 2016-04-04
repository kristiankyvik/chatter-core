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
        }
    },

    events: {

    },

    methods: {

    },

    behaviors: ["timestamp"]
});
