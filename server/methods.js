Meteor.methods({
    "message.build" (params) {
        return new Chatter.Message({
            message: params.message,
            roomId: params.roomId,
            userId: params.userId,
            userNick: params.userNick
        }).save();
    },

    "userroom.build" (roomName) {
        const userId = Meteor.userId();
        const roomId = Chatter.Room.findOne({"name": roomName})._id;

        const records = Chatter.UserRoom.find({"userId": userId, "roomId" : roomId}).fetch();

        if (records === undefined || records.length === 0) {
            return new Chatter.UserRoom({
                roomId: roomId,
                userId: userId
            }).save();
        }
    },

    "room.build" (form) {
        const user = Meteor.user();
        return new Chatter.Room({
            name: form.name,
            _userIds: [user._id],
            roomType: form.roomType
        }).save();
    },

    "room.users" (roomId) {
        const userRooms = Chatter.UserRoom.find({"roomId": roomId}).fetch();
        const users = userRooms.map(function(userRoom) {
            const user = Meteor.users.findOne({_id: userRoom.userId });
            console.log(user);
            const userInfo = {
                _id: user._id,
                nick: user.emails[0].address
            };
            return userInfo;
        });
        return users;
    }
});
