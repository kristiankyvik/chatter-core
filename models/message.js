ChatterMessage = Astro.Class({
    name: "ChatterMessage",
    collection: new Mongo.Collection("chattermessage"),
    
    fields: {
        userId: {
            type: "string"
        },
        
        
    },
    
    events: {
        
    },
    
    methods: {
        
    },
    
    behaviors: ["timestamp"]
});