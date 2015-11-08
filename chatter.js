Chatter = {
    options: {
        messageLimit: 30,
        nickProperty: "username",
    }
};


Chatter.configure = function (opts) {
    _.extend(this.options, opts);
};