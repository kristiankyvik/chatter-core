Chatter.Room = ChatterRoom = Astro.Class({
    name: "ChatterRoom",
    collection: new Mongo.Collection("chatterroom"),

    fields: {
        name: "string",

        roomType: {
            type: "string"
        }
    },

    events: {

    },

    methods: {

    },

    behaviors: ["timestamp"]
});
