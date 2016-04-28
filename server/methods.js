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
            roomId: String,
            invitees: [String]
        });

        const room = Chatter.Room.findOne({_id: form.roomId});

        if (room === undefined) {
            return "room does not exist";
        }
        let userNotexists = false;
        _.each(form.invitees, function(chatterUserId) {
            let user = Chatter.User.find({_id: chatterUserId}).fetch();
            if (user.length > 0) {
              Chatter.UserRoom.upsert({
                userId: chatterUserId,
                roomId: room._id
              }, {
                $set: {
                  userId: chatterUserId,
                  roomId: room._id
                }
             });
            } else {
              userNotexists = true;
              return false;
            }
        })
        return userNotexists ? "user does not exist" : Chatter.UserRoom.findOne()._id;;
    },

    "userroom.remove" (params) {
        check(params, {
            userId: String,
            roomId: String
        });

        Chatter.UserRoom.remove({
            userId: params.userId,
            roomId: params.roomId
        });
    },

    "room.build" (form) {
        check(form, {
            name: String,
            description: String
        });
        return new Chatter.Room({
            name: form.name,
            description: form.description
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

    "room.get" (id) {
        check(id, String);
        return Chatter.Room.findOne({
            _id : id
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
