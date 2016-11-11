import { chai } from "meteor/practicalmeteor:chai";
import emptyDatabase from "./test-helpers.js";

describe("Chatter API methods", function () {
  const assert = chai.assert;
  let room;
  let user;
  let update;

  beforeEach(function () {
    update = sinon.spy(Meteor.users, "update");
    user = Meteor.users.findOne("id_of_user_one");

    const roomId = new Chatter.Room({
      name: "test room",
      description: "test room description"
    }).save();

    room = Chatter.Room.findOne(roomId);

    new Chatter.UserRoom({
      roomId: room._id,
      userId: user._id
    }).save();
  });

  afterEach(function () {
    update.restore();
    emptyDatabase();
  });

  describe("Chatter.addUser method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.addUser.bind(Chatter, {}), Error, "Match error: Missing key \'userId\'");
    });

    it("call Meteor.users.update() once and returns id if succesfull", function () {
      const params = {
        userId: user._id,
        admin: false
      };
      const response = Chatter.addUser(params);
      assert.equal(response, user._id);
      sinon.assert.calledOnce(update);
    });

    it("throws and error if user does not exist", function () {
      const params = {userId: "non-existent-id"};
      assert.throws(Chatter.addUser.bind(Chatter, params), Error, "user id provided is not correct [user-does-not-exist]");
    });
  });

  describe("Chatter.setNickname method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.setNickname.bind(Chatter, {nickname: "test-nickname"}), Error, "Match error: Missing key \'userId\'");
    });

    it("call Meteor.users.update() once and returns id if succesfull", function () {
      const params = {
        userId: user._id,
        nickname: "test_nickname"
      };
      const response = Chatter.setNickname(params);
      assert.equal(response, user._id);
      sinon.assert.calledOnce(update);
    });

    it("throws and error if user does not exist", function () {
      const params = {
        userId: "non-existent-id",
        nickname: "test_nickname"
      };
      assert.throws(Chatter.setNickname.bind(Chatter, params), Error, "user id provided is not correct [user-does-not-exist]");
    });
  });

  describe("Chatter.addRoom method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.addRoom.bind(Chatter, {description: "test description"}), Error, "Match error: Missing key \'name\'");
    });

    it("returns room id if succesfull", function () {
      const params = {
        name: "test name",
        description: "test description",
      };

      const response = Chatter.addRoom(params);
      assert.isString(response);
    });


    it("actually creates the room", function () {
      const params = {
        name: "new room name",
        description: "test description",
      };

      Chatter.addRoom(params);
      const result = Chatter.Room.findOne({name: "new room name"});
      assert.equal(result.name, "new room name");
    });
  });

  describe("Chatter.addRoom method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.addRoom.bind(Chatter, {description: "test description"}), Error, "Match error: Missing key \'name\'");
    });

    it("returns room id if succesfull", function () {
      const params = {
        name: "test name",
        description: "test description"
      };

      const response = Chatter.addRoom(params);
      assert.isString(response);
    });


    it("actually creates the room", function () {
      const params = {
        name: "new room name",
        description: "test description"
      };

      Chatter.addRoom(params);
      const result = Chatter.Room.findOne({name: "new room name"});
      assert.equal(result.name, "new room name");
    });
  });

  describe("Chatter.addUserToRoom method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.addUserToRoom.bind(Chatter, {roomId: "test roomId"}), Error, "Match error: Missing key \'userId\'");
    });

    it("throws and error if user does not exist", function () {
      const params = {
        userId: "non_existing_user_id",
        roomId: room._id
      };
      assert.throws(Chatter.addUserToRoom.bind(Chatter, params), Error, "user id provided is not correct [user-does-not-exist]");
    });

    it("throws and error if room does not exist", function () {
      const params = {
        userId: user._id,
        roomId: "non_existing_room_id"
      };
      assert.throws(Chatter.addUserToRoom.bind(Chatter, params), Error, "room id provided is not correct [room-does-not-exist]");
    });

    it("returns userRoom id if succesfull", function () {
      const params = {
        userId: user._id,
        roomId: room._id
      };

      const response = Chatter.addUserToRoom(params);
      assert.isString(response);
    });

    it("actually add the user to the room", function () {
      const params = {
        userId: user._id,
        roomId: room._id
      };

      Chatter.addUserToRoom(params);
      const result = Chatter.UserRoom.findOne(params);
      assert.equal(result.userId, user._id);
      assert.equal(result.roomId, room._id);
    });
  });

  describe("Chatter.removeUserFromRoom method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.removeUserFromRoom.bind(Chatter, {roomId: "test roomId"}), Error, "Match error: Missing key \'userId\'");
    });

    it("throws and error if user does not exist", function () {
      const params = {
        userId: "non_existing_user_id",
        roomId: room._id
      };
      assert.throws(Chatter.removeUserFromRoom.bind(Chatter, params), Error, "user id provided is not correct [user-does-not-exist]");
    });

    it("throws and error if room does not exist", function () {
      const params = {
        userId: user._id,
        roomId: "non_existing_user_id"
      };
      assert.throws(Chatter.removeUserFromRoom.bind(Chatter, params), Error, "room id provided is not correct [room-does-not-exist]");
    });

    it("returns 1 if succesfull", function () {
      const params = {
        userId: user._id,
        roomId: room._id
      };

      const response = Chatter.removeUserFromRoom(params);
      assert.equal(response, 1);
    });

    it("actually removes user from the room", function () {
      const params = {
        userId: user._id,
        roomId: room._id
      };

      Chatter.removeUserFromRoom(params);
      const result = Chatter.UserRoom.find(params).fetch();
      assert.equal(result.length, 0);
    });
  });

  describe("Chatter.removeRoom method", function () {
    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.removeRoom.bind(Chatter, {}), Error, "Match error: Missing key \'roomId\'");
    });

    it("throws and error if room does not exist", function () {
      const params = {
        roomId: "non_existing_room_id"
      };
      assert.throws(Chatter.removeRoom.bind(Chatter, params), Error, "room id provided is not correct [room-does-not-exist]");
    });

    it("returns 1 if succesfull", function () {
      const params = {
        roomId: room._id
      };

      const response = Chatter.removeRoom(params);
      assert.equal(response, 1);
    });

    it("actually removes user from the room", function () {
      const params = {
        roomId: room._id
      };

      Chatter.removeRoom(params);
      const rooms = Chatter.Room.find(params).fetch();
      assert.equal(rooms.length, 0);
      const userRooms = Chatter.Room.find({roomId: room._id}).fetch();
      assert.equal(userRooms.length, 0);
    });
  });

  describe("Chatter.removeUser method", function () {
    before(function () {
      remove = sinon.spy(Meteor.users, "remove");
    });

    after(function () {
      remove.restore();
    });

    it("throws and error if parameters are missing", function () {
      assert.throws(Chatter.removeUser.bind(Chatter, {}), Error, "Match error: Missing key \'userId\'");
    });

    it("call Meteor.users.remove() once and returns id if succesfull", function () {
      const params = {
        userId: user._id
      };
      const response = Chatter.removeUser(params);
      assert.equal(response, user._id);
      sinon.assert.calledOnce(remove);
    });

    it("actually removes user messages and user rooms if succesfull", function () {
      const params = {
        userId: user._id
      };
      Chatter.removeUser(params);
      assert.equal(Chatter.Message.find({userId: user._id}).fetch().length, 0);
      assert.equal(Chatter.UserRoom.find({userId: user._id}).fetch().length, 0);
      assert.isUndefined(Chatter.Room.findOne(room._id));
    });

    it("throws and error if user does not exist", function () {
      const params = {
        userId: "non-existent-id"
      };
      assert.throws(Chatter.removeUser.bind(Chatter, params), Error, "user id provided is not correct [user-does-not-exist]");
    });
  });
});
