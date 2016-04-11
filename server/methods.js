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
            userId: params.userId
        }).save();
    },

    "userroom.build" (form) {
        check(form, {
            name: String,
            invitees: [String]
        });

        const roomId = Chatter.Room.findOne({"name": form.name})._id;

        _.each(form.invitees, function(chatterUserId) {
          new Chatter.UserRoom({
              roomId: roomId,
              userId: chatterUserId
          }).save();
        })
    },

    "room.build" (form) {
        check(form, {
            name: String,
            invitees: [String]
        });
        return new Chatter.Room({
            name: form.name
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

    "room.archive" (id, archived) {
        check(id, String);
        check(archived, Boolean);
        return Chatter.Room.update({
            _id : id
        },
        {
            $set:{archived: archived}
        });
    },

    "room.users" (roomId) {
        check(roomId, String);
        const userRooms = Chatter.UserRoom.find({"roomId": roomId}).fetch();
        const users = userRooms.map(function(userRoom) {
            const user = Chatter.User.findOne({_id: userRoom.userId });
            return user;
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
