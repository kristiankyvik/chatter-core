import { chai } from "meteor/practicalmeteor:chai";

describe("chatter api methods", function () {
  let user;
  let room;
  let meteorUser;
  const assert = chai.assert;

  before(function() {
    meteorUser = Meteor.users.findOne({_id: "id_of_user_one"});

    const userId = Chatter.addUser(meteorUser._id, "admin");
    user = Chatter.User.findOne({_id: userId});

    const roomId = Chatter.addRoom("test room");
    room = Chatter.Room.findOne({_id: roomId});
  });

  it("chatter user is added", function() {
    assert.equal(user.userId, meteorUser._id);
  });

  it("chatter room is added", function() {
    assert.equal(room.name, "test room");
  });

  it("chatter user is added to chatter room", function() {
    Chatter.addUserToRoom(user.userId, room._id);
    const roomUsers = Chatter.UserRoom.find({userId: user._id, roomId: room._id}).fetch();
    assert.lengthOf(roomUsers, 1);
  });

});
