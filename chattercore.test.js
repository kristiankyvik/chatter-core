import { chai } from 'meteor/practicalmeteor:chai';

//Server side test, will be moved to separate folder /server

if (Meteor.isServer) {

  describe('chatter message model', function () {

    //initilizing test message
    const attributes = {
      message: "test message",
      userId: "testUserId",
      roomId: "testRoomId"
    };

    const messageId = Chatter.Message.insert(attributes);
    const message = Chatter.Message.findOne({_id: messageId});
    console.log(message.timeAgo(), "a few seconds ago");

    it('message is inserted with correct attributes', function () {
      chai.assert.equal(message.userId, attributes.userId);
      chai.assert.equal(message.roomId, attributes.roomId);
      chai.assert.equal(message.message, attributes.message);
    });


    it('message returns the correct timeAgo when calling timeAgo()', function () {
      chai.assert.equal(message.timeAgo(), "a few seconds ago");
    });

    Chatter.Message.remove({_id: messageId});

  });

  describe('chatter room model', function () {

    //initilizing test room
    const attributes = {
      name: "test room",
      description: "test description",
      createdBy: "test creator"
    };

    const then = new Date();
    const roomId = Chatter.Room.insert(attributes);
    const room = Chatter.Room.findOne({_id: roomId});
    console.log(room.lastActive.getTime(), then.getTime());

    it('room is inserted with correct attributes', function () {
      chai.assert.equal(room.name, attributes.name);
      chai.assert.equal(room.description, attributes.description);
      chai.assert.equal(room.createdBy, attributes.createdBy);
    });

    it('room is inserted with correct defaults', function () {
      chai.assert.equal(room.archived, false);
      chai.assert.equal(room.lastActive.getTime(), then.getTime());
    });

    Chatter.Room.remove({_id: roomId});

  });


  describe('chatter user model', function () {

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


    it('User is inserted with correct attributes', function () {
      chai.assert.equal(defaultUser.userType, attributes.userType);
      chai.assert.equal(defaultUser.userId, attributes.userId);
      chai.assert.equal(defaultUser.nickname, attributes.nickname);
    });

    it('User is inserted with correct defaults', function () {
      chai.assert.equal(defaultUser.avatar, "http://localhost:3000/packages/jorgeer_chatter-semantic/public/images/avatar.jpg");
    });

    it('User is inserted when overwritting defaults', function () {
      chai.assert.equal(customUser.avatar, "test avatar");
    });

    Chatter.User.remove({_id: defaultUserId});
    Chatter.User.remove({_id: customUserId});

  });

  describe('chatter userroom model', function () {

    //initilizing test user
    const attributes = {
      userId: "test user id",
      roomId: "testRoomId"
    };

    const userRoomId = Chatter.UserRoom.insert(attributes);
    const userRoom = Chatter.UserRoom.findOne({_id: userRoomId});

    it('User Room is inserted with correct attributes', function () {
      chai.assert.equal(userRoom.userId, attributes.userId);
      chai.assert.equal(userRoom.roomId, attributes.roomId);
    });

    it('User Room is inserted with correct defaults', function () {
      chai.assert.equal(userRoom.count, 0);
    });

    Chatter.UserRoom.remove({_id: userRoomId});
  });

}

