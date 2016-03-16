Meteor.methods({
    "userroom.build" (roomName) {
        var userId = Meteor.userId();
        var roomId = Chatter.Room.findOne({"name": roomName})._id;

        var records = Chatter.UserRoom.find({"userId": userId, "roomId" : roomId}).fetch();

        if (records === undefined || records.length == 0) {
            return new Chatter.UserRoom({
                roomId: roomId,
                userId: userId
            }).save();
        }
    },

    "room.build" (form) {
        var user = Meteor.user();
        var user_email = user.emails[0].address;
        var nickname = user_email.slice(0, user_email.indexOf("@"));
        return new Chatter.Room({
            name: form.name,
            _userIds: [user._id],
            roomType: form.roomType
        }).save();
    }
});
