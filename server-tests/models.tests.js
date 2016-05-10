import { chai } from "meteor/practicalmeteor:chai";

describe("chatter models", function () {
  const assert = chai.assert;

  describe("chatter message model", function () {

    //initilizing test message
    const attributes = {
      message: "test message",
      userId: "testUserId",
      roomId: "testRoomId"
    };

    let messageId;
    let message;

    before(function() {
      messageId = Chatter.Message.insert(attributes);
      message = Chatter.Message.findOne({_id: messageId});
    });

    it("message is inserted with correct attributes", function () {
      assert.equal(message.userId, attributes.userId);
      assert.equal(message.roomId, attributes.roomId);
      assert.equal(message.message, attributes.message);
    });


    it("message returns the correct timeAgo when calling timeAgo()", function () {
      assert.equal(message.timeAgo(), "a few seconds ago");
    });

  });

  describe("chatter room model", function () {

    //initilizing test room
    const attributes = {
      name: "test room",
      description: "test description",
      createdBy: "test creator"
    };

    let then;
    let roomId;
    let room;

    before(function() {
      then = new Date();
      roomId = Chatter.Room.insert(attributes);
      room = Chatter.Room.findOne({_id: roomId});
    });

    it("room is inserted with correct attributes", function () {
      assert.equal(room.name, attributes.name);
      assert.equal(room.description, attributes.description);
      assert.equal(room.createdBy, attributes.createdBy);
    });

    it("room is inserted with correct defaults", function () {
      assert.equal(room.archived, false);
      const now = new Date();
      assert.equal(now.getTime() - room.lastActive.getTime() < 20000, true);
    });

  });

  describe("chatter user model", function () {

    //initilizing test user
    const attributes = {
      userType: "test user type",
      userId: "test user id",
      nickname: "test nickname"
    };

    const defaultUserId = Chatter.User.insert(attributes);
    const defaultUser = Chatter.User.findOne({_id: defaultUserId});

    attributes.avatar = "test avatar";

    const customUserId = Chatter.User.insert(attributes);
    const customUser = Chatter.User.findOne({_id: customUserId});


    it("User is inserted with correct attributes", function () {
      assert.equal(defaultUser.userType, attributes.userType);
      assert.equal(defaultUser.userId, attributes.userId);
      assert.equal(defaultUser.nickname, attributes.nickname);
    });

    it("User is inserted with correct defaults", function () {
      assert.equal(defaultUser.avatar, "http://localhost:3000/packages/jorgeer_chatter-semantic/public/images/avatar.jpg");
    });

    it("User is inserted when overwritting defaults", function () {
      assert.equal(customUser.avatar, "test avatar");
    });
  });

  describe("chatter userroom model", function () {

    //initilizing test user
    const attributes = {
      userId: "test user id",
      roomId: "testRoomId"
    };

    let userRoomId;
    let userRoom;

    before(function() {
      userRoomId = Chatter.UserRoom.insert(attributes);
      userRoom = Chatter.UserRoom.findOne({_id: userRoomId});
    });

    it("User Room is inserted with correct attributes", function () {
      assert.equal(userRoom.userId, attributes.userId);
      assert.equal(userRoom.roomId, attributes.roomId);
    });

    it("User Room is inserted with correct defaults", function () {
      assert.equal(userRoom.count, 0);
    });

    Chatter.UserRoom.remove({_id: userRoomId});
  });
});
