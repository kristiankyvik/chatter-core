import { chai } from "meteor/practicalmeteor:chai";
import { resetDatabase } from "meteor/xolvio:cleaner";

before(function() {
  //create stub for findOne method
  stubs.create("findOne", Meteor.users, "findOne");
  stubs.findOne.returns({
    _id: "43hk2j4h324k3j2",
    username: "test nickname stub"
  });
});

after(function() {
  resetDatabase();
});

describe("chatter models", function () {
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
      chai.assert.equal(message.userId, attributes.userId);
      chai.assert.equal(message.roomId, attributes.roomId);
      chai.assert.equal(message.message, attributes.message);
    });


    it("message returns the correct timeAgo when calling timeAgo()", function () {
      chai.assert.equal(message.timeAgo(), "a few seconds ago");
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
      chai.assert.equal(room.name, attributes.name);
      chai.assert.equal(room.description, attributes.description);
      chai.assert.equal(room.createdBy, attributes.createdBy);
    });

    it("room is inserted with correct defaults", function () {
      chai.assert.equal(room.archived, false);
      const now = new Date();
      chai.assert.equal(now.getTime() - room.lastActive.getTime() < 20000, true);
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
      chai.assert.equal(defaultUser.userType, attributes.userType);
      chai.assert.equal(defaultUser.userId, attributes.userId);
      chai.assert.equal(defaultUser.nickname, attributes.nickname);
    });

    it("User is inserted with correct defaults", function () {
      chai.assert.equal(defaultUser.avatar, "http://localhost:3000/packages/jorgeer_chatter-semantic/public/images/avatar.jpg");
    });

    it("User is inserted when overwritting defaults", function () {
      chai.assert.equal(customUser.avatar, "test avatar");
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
      chai.assert.equal(userRoom.userId, attributes.userId);
      chai.assert.equal(userRoom.roomId, attributes.roomId);
    });

    it("User Room is inserted with correct defaults", function () {
      chai.assert.equal(userRoom.count, 0);
    });

    Chatter.UserRoom.remove({_id: userRoomId});
  });
});

//Chatter API tests
describe("chatter api methods", function () {
  let user;
  let room;

  before(function() {
    //add chatter user
    const meteorUser = Meteor.users.findOne();
    const userId = Chatter.addUser(meteorUser._id, "admin");
    user = Chatter.User.findOne({_id: userId});

    //add chatter room
    const roomId = Chatter.addRoom("test room");
    room = Chatter.Room.findOne({_id: roomId});
  });

  it("chatter user is added", function() {
    chai.assert.equal(user.userId, "43hk2j4h324k3j2");
  });

  it("chatter room is added", function() {
    chai.assert.equal(room.name, "test room");
  });

  it("chatter user is added to chatter room", function() {
    Chatter.addUserToRoom(user.userId, room._id);
    const roomUsers = Chatter.UserRoom.find({userId: user._id, roomId: room._id}).fetch();
    chai.assert.lengthOf(roomUsers, 1);
  });

});

//Chatter Method tests
describe("chatter meteor methods", function() {
  let user;

  before(function() {
    //add chatter user
    const meteorUser = Meteor.users.findOne();
    const userId = Chatter.addUser(meteorUser._id, "admin");
    user = Chatter.User.findOne({_id: userId});
  });

  describe("user.check method", function () {
    it("user.check return false when user does not exist", function() {
      const nonUserCheck = Meteor.call("user.check", "sfdsfdsfdsfd");
      chai.assert.equal(nonUserCheck, false);
    });

    it("user.check returns true when user exists", function() {
      const userCheck = Meteor.call("user.check", user.userId);
      chai.assert.equal(userCheck, true);
    });
  });

  describe("message.build method", function (done) {
    let params;

    before(function() {
      params = {};
    });

    it("message.build throws exception when parameters are missing", function (done) {

      Meteor.call("message.build", params, function(error, response) {
        setTimeout(function() {
          chai.assert.isUndefined(response);
          chai.assert.equal(error.errorType, "Match.Error");
          done();
        });
      });
    });

    it("message.build succeeds when no parameters are missing", function (done) {
      params.userId = "test userId";
      params.message = "test message";
      params.roomId = "test roomId";

      Meteor.call("message.build", params, function(error, response) {
        setTimeout(function() {
          chai.assert.isUndefined(error);
          chai.assert.isString(response);
          done();
        });
      });
    });

    it("message.build throws exception when parameters are wrong type", function (done) {
      params.message = 123123;

      Meteor.call("message.build", params, function(error, response) {
        setTimeout(function() {
          chai.assert.isUndefined(response);
          chai.assert.equal(error.errorType, "Match.Error");
          done();
        })
      });
    });
  });

  describe("userRoom methods", function (done) {
    //initilizing test room
    const attributes = {
      name: "test room",
      description: "test description",
      createdBy: "test creator"
    };

    let params;
    let room;
    let user;


    before(function() {
      params = {};
      roomId = Chatter.Room.insert(attributes);
      room = Chatter.Room.findOne({_id: roomId});

      const meteorUser = Meteor.users.findOne();
      const userId = Chatter.addUser(meteorUser._id, "admin");
      user = Chatter.User.findOne({_id: userId});
    });

    describe("userroom.build method", function (done) {
      describe("when parameters are missing or wrong", function (done) {
        it("returns exception when parameters are missing ", function (done) {

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.isUndefined(response);
              chai.assert.equal(error.errorType, "Match.Error");
            });
          });

          params.name = room.name;

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.isUndefined(response);
              chai.assert.equal(error.errorType, "Match.Error");
            });
          });

          params.roomId = room._id;

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.isUndefined(response);
              chai.assert.equal(error.errorType, "Match.Error");
              done();
            });
          });
        });

        it("returns 'room does not exist' when roomId does not exist", function (done) {
          params.roomId = "non existent roomId";
          params.invitees = [user._id];

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.equal(response, "room does not exist");
              done();
            });
          });
        });

        it("returns 'user does not exist' when userId does not exist", function (done) {
          params.invitees = ["non existent userId"];
          params.roomId = room._id;

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.equal(response, "user does not exist");
              done();
            });
          });
        });
      });

      describe("when no parameters are missing or wrong", function (done) {

        it("creates a userRoom instance", function (done) {
          params.invitees = [user._id];
          params.roomId = room._id;

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.isUndefined(error);
              chai.assert.isString(response);
              done();
            });
          });
        });
      });
    });

    describe("userroom.remove method", function (done) {

      it("throw an error if missing parameters", function (done) {
        params = {};
        Meteor.call("userroom.remove", params, function(error, response) {
          setTimeout(function() {
            chai.assert.isUndefined(response);
            chai.assert.equal(error.errorType, "Match.Error");
            done();
          });
        });
      });

      it("remove userroom if no missing parameters missing or incorrect", function () {
        Meteor.call("userroom.remove", {userId: user._id, roomId: room._id});
        const results = Chatter.UserRoom.find({userId: user._id, roomId: room._id}).fetch();
        chai.assert.equal(results.length, 0);
      });
    });

  });
});
