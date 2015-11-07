ChatterRoom = Astro.Class({
    name: "ChatterRoom",
    collection: new Mongo.Collection("chatterroom"),
    
    fields: {
        field
    },
    
    events: {
        
    },
    
    methods: {
        
    },
    
    behaviors: ["timestamp"]
});