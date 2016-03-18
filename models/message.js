Chatter.Message = ChatterMessage = Astro.Class({
    name: "ChatterMessage",
    collection: new Mongo.Collection("chattermessage"),

    fields: {
        userId: {
            type: "string"
        },

        roomId: {
            type: "string"
        },

        userNick: {
            type: "string"
        },

        message: {
            type: "string"
        },

    },

    events: {

    },

    methods: {
        timeAgo: function () {
            return moment(this.get("createdAt")).fromNow();
        }
    },

    behaviors: ["timestamp"]
});
