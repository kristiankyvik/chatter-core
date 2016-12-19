const userInRoom = function (userId, roomId) {
  const userRooms = Chatter.UserRoom.find({userId: userId, roomId}).fetch();
  return userRooms.length > 0;
};

const checkIfChatterUser = function (userId) {
  const user = Meteor.users.findOne(userId);
  if (_.isEmpty(user)) throw new Meteor.Error("user-has-no-chatter-user", "user has not been added to chatter");
};

const capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export {userInRoom, checkIfChatterUser, capitalize};
