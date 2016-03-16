Chatter.UserRoom = ChatterUserRoom = Astro.Class({
    name: "ChatterUserRoom",
    collection: new Mongo.Collection("ChatterUserRoom"),

    fields: {
        userId: {
            type: "string"
        },

        roomId: {
            type: "string"
        }

    },

    events: {

    },

    methods: {

    },

    behaviors: ["timestamp"]
});
