function getNickname(user) {
    const nickPath = Chatter.options.nickProperty;
    const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);
    return nick;
}


function getAvatar(user) {
    const avatarPath = Chatter.options.avatarProperty;
    const avatar = avatarPath.split('.').reduce((prevVal, el) => prevVal[el] , user);
    return avatar;
}

Meteor.methods({
    "user.check" (userId) {
        check(userId, String);
        const chatterUsers = Chatter.User.find({userId: userId}).fetch();
        return chatterUsers.length > 0;
    },

    "message.build" (params) {
        check(params, {
              message: String,
              roomId: String,
              userId: String
        });
        return new Chatter.Message({
            message: params.message,
            roomId: params.roomId,
            userId: params.userId,
            userNick: getNickname(Meteor.user()),
            userAvatar: getAvatar(Meteor.user())
        }).save();
    },

    "userroom.build" (roomName) {
        check(roomName, String);
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
        check(form, {
            name: String,
            roomType: String
        });
        const user = Meteor.user();
        return new Chatter.Room({
            name: form.name,
            roomType: form.roomType
        }).save();
    },

    "room.update" (id) {
        check(id, String);
        Chatter.Room.update({
            _id : id
        },
        {
            $set:{lastActive : new Date()}
        });
    },

    "room.users" (roomId) {
        check(roomId, String);
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
    },

    "userroom.count.reset" (userId, roomId) {
        check(userId, String);
        check(roomId, String);
        return Chatter.UserRoom.update({
            roomId : roomId,
            userId: userId
        },
        {
            $set:{count: 0}
        });
    },

    "userroom.count.increase" (userId, roomId) {
        check(userId, String);
        check(roomId, String);
        const userRooms = Chatter.UserRoom.find({"roomId": roomId, "userId": {$nin:[userId]}}).fetch();
        const users = userRooms.map(function(userRoom) {
            Chatter.UserRoom.update({
                roomId : userRoom.roomId,
                userId: userRoom.userId
            },
            {
                $inc: { count: 1}
            });
        });
    }
});
