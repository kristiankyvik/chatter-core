import { chai } from "meteor/practicalmeteor:chai";
import emptyDatabase from "./test-helpers.js";

describe("chatter api methods", function () {

  const assert = chai.assert;

  afterEach(function() {
    emptyDatabase();
  });

  describe("creating methods", function() {
    let chatterUser;
    let room;
    let meteorUser;

    before(function() {
      meteorUser = Meteor.users.findOne("id_of_user_one");

      const userId = new Chatter.User({
        userId: meteorUser._id,
        userType: "admin",
        nickname: "test nickname"
      }).save();

      chatterUser = Chatter.User.findOne(userId);

      const roomId = new Chatter.Room({
        name: "test room",
        description: "test room description"
      }).save();
      room = Chatter.Room.findOne(roomId);
    });

    it("chatter user is added", function() {
      assert.equal(chatterUser.userId, meteorUser._id);
    });

    it("chatter room is added", function() {
      assert.equal(room.name, "test room");
      assert.equal(room.description, "test room description");
    });

    it("chatter user is added to chatter room", function() {
      new Chatter.UserRoom({
        userId: chatterUser._id,
        roomId: room._id
      }).save();
      const roomUsers = Chatter.UserRoom.find({userId: chatterUser._id, roomId: room._id}).fetch();
      assert.lengthOf(roomUsers, 1);
    });
  })

  describe("destruction methods", function() {
    let chatterUser;
    let room;
    let userRoom;
    let meteorUser;

    beforeEach(function() {
      meteorUser = Meteor.users.findOne("id_of_user_one");

      const userId = new Chatter.User({
        userId: meteorUser._id,
        userType: "admin",
        nickname: "test nickname"
      }).save();

      chatterUser = Chatter.User.findOne(userId);

      const roomId = new Chatter.Room({
        name: "test room",
        description: "test room description"
      }).save();
      room = Chatter.Room.findOne(roomId);


      const userRoomId = new Chatter.UserRoom({
        userId: chatterUser._id,
        roomId: room._id
      }).save();

      userRoom = Chatter.UserRoom.findOne(userRoomId);
    });

    it("chatter user is removed from room", function() {
      const params = {
        userId: meteorUser._id,
        roomId: room._id
      };
      Chatter.removeUserFromRoom(params);
      assert.isUndefined(Chatter.UserRoom.findOne({userId: chatterUser._id, roomId: room._id}),  "user does no longer exist");
    });

    it("chatter room is removed", function() {
      const params = {
        roomId: room._id
      };
      Chatter.removeRoom(params);
      assert.isUndefined(Chatter.Room.findOne(room._id),  "room does no longer exist");
    });

    it("chatter user is removed", function() {
      const params = {
        userId: meteorUser._id
      };
      Chatter.removeUser(params);
      assert.isUndefined(Chatter.User.findOne(meteorUser._id),  "user does no longer exist");
    });

  });

});
