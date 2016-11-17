const emptyDatabase = function () {
  Chatter.UserRoom.remove({});
  Chatter.Room.remove({});
  Chatter.Message.remove({});
};

const callbackWrapper = function (fn) {
  return function (error, response) {
    setTimeout(() => fn(error, response));
  };
};

export {emptyDatabase, callbackWrapper};
