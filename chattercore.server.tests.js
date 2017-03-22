import { chai } from "meteor/practicalmeteor:chai";
import sinon from "meteor/practicalmeteor:sinon";

before(function () {

  stubs.create("user", Meteor, "user");
  stubs.user.returns({
    _id: "id_of_user_one",
    username: "user_one_nickname",
    profile: {
      isChatterAdmin: true
    }
  });

  stubs.create("find", Meteor.users, "find");

  stubs.find.withArgs({_id: "id_of_user_one"}, {fields: {_id: 1}, limit: 1}).returns({
    count: function () {
      return 1;
    }
  });

  stubs.find.withArgs({_id: "non existent userId"}, {fields: {_id: 1}, limit: 1}).returns({
    count: function () {
      return 0;
    }
  });

  stubs.find.withArgs({ _id: 'help_user' }, {fields: {_id: 1}, limit: 1}).returns({
    count: function () {
      return 1;
    },
    fetch: function () {
      return [{
        _id: "help_user",
        username: "help user username",
        profile: {
          isChatterAdmin: true,
          supportUser: "help_user"
        }
      }];
    }
  });

  stubs.create("findOne", Meteor.users, "findOne");

  stubs.findOne.withArgs("id_of_user_one").returns({
    _id: "id_of_user_one",
    username: "user_one_nickname",
    profile: {
      isChatterAdmin: true
    }
  });

  stubs.findOne.withArgs("non_admin_user_id").returns({
    _id: "non_admin_user_id",
    username: "non_admin_user_nickname",
    profile: {
      isChatterAdmin: false
    }
  });

  stubs.findOne.withArgs({username: "help_user"}).returns({
    _id: "help_user_id",
    username: "help_user"
  });

  stubs.findOne.withArgs("non existent userId").returns(undefined);
});

import { modelTests } from "./server-tests/models.tests.js";
import { apiTests } from "./server-tests/api.tests.js";
import { methodTests } from "./server-tests/methods.tests.js";
