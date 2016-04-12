ChatterMessage.getCollection().allow({
    insert: function (userId, doc) {
        let ownsMessage = userId === doc.userId;

        if (!ownsMessage) {
            console.log("not owner", doc);
            throw new Meteor.Error("not_owner", "You are not the owner of this message");
        }

        let user = Meteor.users.findOne(userId);

        if (_.isUndefined(user)) {
            console.log("user undefined");
            throw new Meteor.Error("cant_find_user", "Can't find specified user");
        }

        return true;
    }
})


ChatterUserRoom.getCollection().allow({
    insert: function (userId) {
        return true;
    }
})

