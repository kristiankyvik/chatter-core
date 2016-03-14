Chatter.Room = ChatterRoom = Astro.Class({
    name: "ChatterRoom",
    collection: new Mongo.Collection("chatterroom"),

    fields: {
        name: "string",

        roomType: {
            type: "string"
        },

        userNicks: {
            type: "array"
        },

        // Tie the nickname to a userId
        // but don't expose this to the client
        // nick: userId
        _userIds: {
            type: "object"
        }
    },

    events: {

    },

    methods: {
    },

    behaviors: ["timestamp"]
});
