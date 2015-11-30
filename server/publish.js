Meteor.publish("chatterMessages", function (opts) {
    check(opts, {
        roomName: String,
        messageLimit: Number
    });
    
    /*
    let room = ChatterRoom.findOne({ name: opts.roomName });
    if (_.isUndefined(room)) return [];
    // TODO Check for room restrictions here
    */
   
    return ChatterMessage.find({
        roomName: opts.roomName,
    }, {
        limit: opts.limit,
        fields: {
            message: 1,
            roomName: 1,
            userNick: 1,
        }
    });
});

Meteor.publish("chatterRooms", function () {
    let user = Meteor.users.findOne(this.userId);
    
    // TODO do some clever things here to determine
    // which rooms are accessible
    
    return ChatterRoom.find({
        roomType: "public"
    }, {
        fields: {
            name: 1,
            roomType: 1,
            userNicks: 1
        }
    });
});


Meteor.publish("chatterUsers", function (roomName) {
    check(roomName, String)
    
    
    // TODO do some clever things here to determine
    // which users are visible
    
    return Meteor.users.find({
        "status.online": true
    }, {
        // TODO Get the nickname field from configuration
    });
});
