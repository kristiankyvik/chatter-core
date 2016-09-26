import {userInRoom, checkIfChatterUser, capitalize} from "../utils.js";

Meteor.methods({
  "message.send" (params) {
    // check(params, {
    //   message: String,
    //   roomId: String
    // });

    const {message, roomId} = params;
    const userId =  Meteor.userId();

    checkIfChatterUser(userId);

    if (!userInRoom(userId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    Chatter.Message.insert({
      userId,
      message,
      roomId
    });

    // const newMessage = new Chatter.Message({
    //   userId,
    //   message,
    //   roomId
    // });

    // if (newMessage.validate()) {
    //   return newMessage.save();
    // }

    // newMessage.throwValidationException();
  }
});
