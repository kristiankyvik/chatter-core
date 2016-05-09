import { Meteor } from 'meteor/meteor';
import { resetDatabase } from "meteor/xolvio:cleaner";

Meteor.methods({
  "createTestUser"() {
    resetDatabase();

    Accounts.createUser({
      email : "kyvik_bcn@yahoo.es",
      password : "banana"
    });

    const meteorUser = Meteor.users.findOne();

    Chatter.User.insert({
      userId: meteorUser._id,
      nickname: meteorUser.emails[0].address
    });
  },

  "createTestAdmin"() {
    resetDatabase();

    Accounts.createUser({
      email : "kyvik_bcn@yahoo.es",
      password : "banana"
    });

    const meteorUser = Meteor.users.findOne();

    Chatter.User.insert({
      userId: meteorUser._id,
      nickname: meteorUser.emails[0].address,
      userType: "admin"
    });
  },

  "createTestRoom"() {
    Chatter.Room.insert({
      name: "Test Room",
      description: "This is the description of the test room"
    });
    const room = ChatterRoom.findOne();

    Chatter.UserRoom.insert({
      userId: Chatter.User.findOne()._id,
      roomId: room._id
    });
  }

});
