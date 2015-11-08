Meteor.publish("chatterMessages", function (opts) {
    check(opts, {
        roomName: String,
        messageLimit: Number
    });
    
    let room = ChatterRoom.findOne({ name: opts.roomName });
    
    if (_.isUndefined(room)) return [];
    // TODO Check for room restrictions here
    
    return ChatterMessage.find({
        name: opts.roomName,
    }, {
        limit: opts.limit,
        fields: {
            message: 1,
            userNick: 1,
        }
    });
});

Meteor.publish("chatterRooms", function () {
    let user = Meteor.users.findOne(this.userId);
    
    // TODO do some clver things here to determine
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
