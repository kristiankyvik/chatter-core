Meteor.methods({
    "message.build" (params) {
        return new Chatter.Message({
            message: params.message,
            roomId: params.roomId,
            userId: params.userId,
            userNick: getNickname(Meteor.user())
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
            roomType: form.roomType
        }).save();
    },

    "room.users" (roomId) {
        const userRooms = Chatter.UserRoom.find({"roomId": roomId}).fetch();
        const users = userRooms.map(function(userRoom) {
            const user = Meteor.users.findOne({_id: userRoom.userId });
            const userInfo = {
                _id: user._id,
                userNick: getNickname(user)
            };
            return userInfo;
        });
        return users;
    }
});

function getNickname(user) {
    const nickPath = Chatter.options.nickProperty;
    const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);
    return nick;
}
