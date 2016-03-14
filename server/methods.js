Meteor.methods({
  "userroom.build" (roomName, userId) {
        var user = Meteor.users.findOne(userId);
        var records = Chatter.UserRoom.find({"userId": userId, "roomName" : roomName}).fetch();

        var user_email = user.emails[0].address;
        var nickname = user_email.slice(0, user_email.indexOf("@"));
        if (records === undefined || records.length == 0) {
            return new Chatter.UserRoom({
                roomName: roomName,
                userId: Meteor.userId(),
                nickname: nickname
            }).save();
        }
        return "error happened";
  }
});
