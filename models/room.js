Chatter.Room = ChatterRoom = Astro.Class({
    name: "ChatterRoom",
    collection: new Mongo.Collection("chatterroom"),

    fields: {
        name: "string",

        roomType: {
            type: "string"
        },

        lastActive: {
            type: "date",
            default: function() {
              return (new Date());
            }
        }
    },

    events: {

    },

    methods: {

    },

    behaviors: ["timestamp"]
});
