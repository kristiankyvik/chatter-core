import emptyDatabase from "./test-helpers.js";

const callbackWrapper = function (fn) {
  return function (error, response) {
    setTimeout(() => fn(error, response));
  };
};

describe("chatter meteor methods", function () {
  let room;
  let user;
  const assert = chai.assert;

  const roomAttributes = {
    name: "test room",
    description: "test description"
  };

  before(function () {
    user = Meteor.users.findOne("id_of_user_one");

    const roomId = new Chatter.Room({name: "test_room" }).save();
    room = Chatter.Room.findOne(roomId);
    userRoom = new Chatter.UserRoom({userId: user._id, roomId: roomId }).save();
  });

  after(function () {
    emptyDatabase();
  });

  describe("message.send and message.count methods", function () {
    it("message.send throws exception when parameters are missing", function (done) {
      const params = {};
      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.errorType, "Match.Error");
        done();
      }));
    });

    it("message.send throws an error when he message text is too long", function () {
      const longMessage = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";
      const params = {};
      params.roomId = room._id;
      params.message = longMessage;

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "validation-error");
        done();
      }));
    });

    it("message.send throws exception when parameters are wrong type", function (done) {
      const params = {};
      params.roomId = room._id;
      params.message = 123123;

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.errorType, "Match.Error");
        done();
      }));
    });

    it("message.send throws exception when message text is empty", function (done) {
      const params = {};
      params.message = "";
      params.roomId = room._id;

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "validation-error");
        done();
      }));
    });

    it("message.send returns id when all parameters are sent correctly", function (done) {
      const params = {};
      params.roomId = room._id;
      params.message = "test message";

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(error);
        assert.isString(response);
        done();
      }));
    });

    it("message.count throws exception when parameters are missing", function (done) {
      Meteor.call("message.count", null, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.errorType, "Match.Error");
        done();
      }));
    });

    it("message.count returns error when room does not exist", function (done) {
      Meteor.call("message.count", "non_existing_room_id", callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "non-existing-room");
        done();
      }));
    });

    it("message.count returns id when all parameters are sent correctly", function (done) {
      const messageCount = Chatter.Message.find({roomId: room._id}).fetch().length;
      Meteor.call("message.count", room._id, callbackWrapper((error, response) => {
        assert.isUndefined(error);
        assert.equal(response, messageCount);
        done();
      }));
    });

    it("message.send throws error when user is not part of room ", function (done) {
      const params = {};
      params.roomId = room._id;
      params.message = "test message";
      Chatter.UserRoom.remove({userId: user._id, roomId: room._id });

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "user-not-in-room");
        done();
      }));
    });
  });

  describe("user.changeNickname method", function () {
    let update;

    before(function () {
      update = sinon.spy(Meteor.users, "update");
    });

    after(function () {
      update.restore();
    });

    it("user.changeNickname throws exception when parameters are missing", function (done) {
      Meteor.call("user.changeNickname", null, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.errorType, "Match.Error");
        done();
      }));
    });

    it("user.changeNickname triggers a Meteor.users.update call", function (done) {
      Meteor.call("user.changeNickname", "new_nickname", callbackWrapper((error, response) => {
        sinon.assert.calledOnce(update);
        assert.equal(response, "new_nickname");
        done();
      }));
    });
  });

  describe("room methods", function () {
    let roomId;

    describe("room.create", function () {
      it("throws an error when required parameters are missing", function (done) {
        const params = {};
        Meteor.call("room.create", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("return roomId when parameters are correct", function (done) {
        const params = roomAttributes;

        Meteor.call("room.create", params, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.isString(response);
          roomId = response;
          done();
        }));
      });

      it("throws a validation error when name is empty string", function (done) {
        const params = {
          name: "",
          description: "test description"
        };

        Meteor.call("room.create", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "validation-error");
          done();
        }));
      });
    });

    describe("room.check", function () {
      it("throws an error when required parameters are missing", function (done) {
        Meteor.call("room.check", null, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("returns true when succesfull", function (done) {
        Meteor.call("room.check", roomId, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.isTrue(response);
          done();
        }));
      });

      it("returns undefined when room does not exist", function (done) {
        Meteor.call("room.check", "none-existing-id", callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.isFalse(response);
          done();
        }));
      });
    });

    describe("room.delete", function () {
      it("throws an error when required parameters are missing", function (done) {
        const params = null;
        Meteor.call("room.delete", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("returns roomId when succesfull", function (done) {
        Meteor.call("room.delete", roomId, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.isString(response);
          done();
        }));
      });

      it("actually deletes the room", function () {
        assert.isUndefined(Chatter.Room.findOne(roomId));
      });
    });
  });

  describe("Other methods", function () {
    describe("room.join method", function () {
      describe("when parameters are missing or wrong", function () {
        it("returns exception when parameters are missing ", function (done) {
          const params = {};
          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.errorType, "Match.Error");
          }));

          params.roomId = room._id;

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.errorType, "Match.Error");
            done();
          }));
        });

        it("returns 'room does not exist' error when roomId does not exist", function (done) {
          const params = {};
          params.roomId = "non existent roomId";
          params.invitees = [user._id];

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.error, "non-existing-room");
            done();
          }));
        });

        it("returns 'user does not exist' error when userId does not exist", function (done) {
          const params = {};
          params.invitees = ["non existent userId"];
          params.roomId = room._id;

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.error, "non-existing-user");
            done();
          }));
        });
      });

      describe("when no parameters are missing or wrong", function () {
        it("creates a userRoom instance", function (done) {
          const params = {};
          params.invitees = [user._id];
          params.roomId = room._id;

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(error);
            assert.isString(response);
            done();
          }));
        });

        it("userRoom is built with archived set to default", function () {
          assert.equal(Chatter.UserRoom.findOne({userId: user._id, roomId: room._id}).archived, false);
        });
      });
    });

    describe("room.archive", function () {
      it("throws an error when params are not right type", function (done) {
        const params = {
          roomId: 124324324,
          archived: false
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("throws an error when params are missing", function (done) {
        const params = {
          roomId: "124324324"
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("throws an error when user is not in room does not exist", function (done) {
        const params = {
          roomId: "non-existing-room",
          userId: user._id,
          archived: true
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "user-not-in-room");
          done();
        }));
      });

      it("returns true after succesfully calling method with true parameter", function (done) {
        const params = {
          archived: true,
          roomId: room._id,
          userId: user._id
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, true);
          done();
        }));
      });

      it("actually changes archived status to true", function () {
        assert.equal(Chatter.UserRoom.findOne({userId: user._id, roomId: room._id}).archived, true);
      });

      it("returns false after succesfully calling method with false parameter", function (done) {
        const params = {
          archived: false,
          roomId: room._id,
          userId: user._id
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, false);
          done();
        }));
      });

      it("actually changed archived status to false", function () {
        assert.equal(Chatter.UserRoom.findOne({userId: user._id, roomId: room._id}).archived, false);
      });
    });

    describe("room.get method", function () {
      it("throw an error if missing parameters", function (done) {
        Meteor.call("room.get", null, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("returns room if no missing parameters missing or incorrect", function (done) {
        Meteor.call("room.get", room._id, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response._id, room._id);
          done();
        }));
      });
    });

    describe("room.users method", function () {
      it("throw an error if missing parameters", function (done) {
        Meteor.call("room.users", null, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("returns room users if no missing parameters missing or incorrect", function (done) {
        Meteor.call("room.users", room._id, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response[0]._id, user._id);
          done();
        }));
      });
    });

    describe("room.leave method", function () {
      it("throw an error if missing parameters", function (done) {
        params = {};
        Meteor.call("room.leave", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("returns room id if no missing parameters missing or incorrect", function (done) {
        Meteor.call("room.leave", {userId: user._id, roomId: room._id}, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, room._id);
          done();
        }));
      });

      it("actually leaves room if called succesfuly", function () {
        Meteor.call("room.leave", {userId: user._id, roomId: room._id});
        const result = Chatter.UserRoom.findOne({userId: user._id, roomId: room._id});
        assert.isUndefined(result);
      });
    });

    describe("room.counter methods", function () {
      before(function () {
        new Chatter.UserRoom({userId: user._id, roomId: room._id }).save();
      });

      it("room counter returns true when called with right parameters", function (done) {
        Meteor.call("room.unreadMsgCount.reset", room._id, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, true);
          done();
        }));
      });

      it("room counter does reset the counter to 0", function () {
        assert.equal(Chatter.UserRoom.findOne({roomId: room._id, userId: user._id}).unreadMsgCount, 0);
      });

      it("room counter return error when wrong roomId is passed in", function (done) {
        Meteor.call("room.unreadMsgCount.reset", "wrong room id", callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "non-existing-room");
          done();
        }));
      });

      it("room counter returns error when user is not in room", function (done) {
        Chatter.UserRoom.remove({userId: user._id, roomId: room._id});

        Meteor.call("room.unreadMsgCount.reset", room._id, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "user-not-in-room");
          done();
        }));
      });
    });
  });
  describe("help.createRoom", function () {
    it("returns error when user has no defined support user", function (done) {
      Meteor.call("help.createRoom", callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "user-has-no-support-user");
        done();
      }));
    });

    it("returns help room id when user has support user assigned", function (done) {
      stubs.findOne.withArgs("id_of_user_one").returns({
        _id: "id_of_user_one",
        username: "help_user",
        profile: {
          isChatterUser: true,
          isChatterAdmin: true,
          supportUser: "help_user"
        }
      });

      Meteor.call("help.createRoom", callbackWrapper((error, response) => {
        assert.isUndefined(error);
        assert.isString(response);
        done();
      }));
    });
  });
});
