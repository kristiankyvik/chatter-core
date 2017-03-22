import {userInRoom, checkIfChatterUser} from "../utils.js";
import Chatter  from '../chatter.js';

Meteor.methods({
  "message.send" (params) {
    this.unblock();
    check(params, {
      message: String,
      roomId: String
    });

    const {message, roomId} = params;

    const user = Meteor.user();

    checkIfChatterUser(user);

    const userId = user._id;

    if (!userInRoom(userId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    const newMessage = new Chatter.Message({
      userId,
      message,
      roomId
    });

    return newMessage.save();
  }
});
