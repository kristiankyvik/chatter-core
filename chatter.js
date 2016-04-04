Chatter = {
    options: {
        messageLimit: 30,
        nickProperty: "username",
    }
};


Chatter.configure = function (opts) {
    _.extend(this.options, opts);
};

Chatter.addUser = function(userId, userType) {
    return Chatter.User.upsert({
        userId: userId
    }, {
        $set: {
          userType: userType
        }
    });
};
