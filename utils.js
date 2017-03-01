const userInRoom = function (userId, roomId) {
  const userRooms = Chatter.UserRoom.find({roomId, userId}, {fields: {_id: 1}, limit: 1}).count();
  return userRooms > 0;
};

const checkIfChatterUser = function (user) {
  if (_.isEmpty(user)) throw new Meteor.Error("user-has-no-chatter-user", "user is not logged in");
};

const capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export {userInRoom, checkIfChatterUser, capitalize};
