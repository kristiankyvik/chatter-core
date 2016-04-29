import { resetDatabase } from "meteor/xolvio:cleaner";

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
      const nonUserCheck = Meteor.call("user.check");
      chai.assert.equal(nonUserCheck, false);
    });

    it("user.check returns true when user exists", function() {
      this.userId ="themuser id";
      const userCheck = Meteor.call("user.check").apply(this);;
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
