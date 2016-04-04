Chatter = {
    options: {
        messageLimit: 30,
        nickProperty: "username",
    }
};


Chatter.configure = function (opts) {
    _.extend(this.options, opts);
};

Chatter.addUser = function(userId, userType) {
    const user = Meteor.users.findOne({_id: userId});
    return Chatter.User.upsert({
        userId: userId
    }, {
        $set: {
          userType: userType,
          nickname: getNickname(user)
        }
    });
};

Chatter.addRoom = function(roomName) {
    return Chatter.Room.upsert({
        name: roomName
    }, {
        $set: {
            name: roomName
        }
    });
};

Chatter.addUserToRoom = function(userId, roomName) {
    const chatterUserId = Chatter.User.findOne({userId: userId})._id;
    const room = Chatter.Room.findOne({name: roomName});

    if (room === undefined) {
        return "room does not exist";
    }

    return Chatter.UserRoom.upsert({
        userId: chatterUserId,
        roomId: room._id
    }, {
        $set: {
            userId: chatterUserId,
            roomId: room._id
        }
    });
};


function getNickname(user) {
    const nickPath = Chatter.options.nickProperty;
    const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);
    return nick;
}
