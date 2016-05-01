import { resetDatabase } from "meteor/xolvio:cleaner";

describe("chatter meteor methods", function() {
  let user;

  before(function() {
    const meteorUser = Meteor.users.findOne();
    const userId = Chatter.addUser(meteorUser._id, "admin");
    user = Chatter.User.findOne({_id: userId});
  });

  describe("user.check method", function () {
    before(function() {
      stubs.create("userId", Meteor, "userId");
    });

    it("user.check return false when user does not exist", function(done) {
      // Creating stub for Meteor.userId() that return id from non-chatter user
      stubs.userId.returns("meteor_unknown_id");

      Meteor.call("user.check", function (error, response){
        setTimeout(function() {
          chai.assert.isUndefined(error);
          chai.assert.equal(response, false);
          done();
        });
      });
    });

    it("user.check returns true when user exists", function() {
      // Creating stub for Meteor.userId() that return id from chatter user
      stubs.userId.returns("meteor_user_one_id");

      Meteor.call("user.check", function (error, response){
        setTimeout(function() {
          chai.assert.isUndefined(error);
          chai.assert.equal(response, true);
          done();
        });
      });
    });
  });

  describe("message.build method", function (done) {
    let params;

    before(function() {
      params = {};
      const roomId = params.roomId = Chatter.Room.insert({name: "test_room" });
      Chatter.UserRoom.insert({userId: user._id, roomId: roomId });
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
      params.message = "test message";

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

    it("message.build throws exception when message text is empty", function (done) {
      params.message = "";

      Meteor.call("message.build", params, function(error, response) {
        setTimeout(function() {
          chai.assert.equal(error.error, "validation-error");
          done();
        })
      });
    });

    it("message.build throws error when user is not part of room ", function (done) {
      Chatter.UserRoom.remove({userId: user._id, roomId: params.roomId });
      params.message = "test message";

      Meteor.call("message.build", params, function(error, response) {
        setTimeout(function() {
          chai.assert.isUndefined(response);
          chai.assert.equal(error.error, "user-not-in-room");
          done();
        })
      });
    });
  });

  describe("userRoom methods", function (done) {

    const roomAttributes = {
      name: "test room",
      description: "test description",
      createdBy: "test creator"
    };

    let params;
    let room;
    let user;


    before(function() {
      params = {};
      const meteorUser = Meteor.users.findOne();
      const userId = Chatter.addUser(meteorUser._id, "admin");

      roomId = Chatter.Room.insert(roomAttributes);
      room = Chatter.Room.findOne({_id: roomId});
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
              chai.assert.isUndefined(response);
              chai.assert.equal(error.error, "non-existing-room");
              done();
            });
          });
        });

        it("returns 'user does not exist' when userId does not exist", function (done) {
          params.invitees = ["non existent userId"];
          params.roomId = room._id;

          Meteor.call("userroom.build", params, function(error, response) {
            setTimeout(function() {
              chai.assert.isUndefined(response);
              chai.assert.equal(error.error, "non-existing-users");
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
