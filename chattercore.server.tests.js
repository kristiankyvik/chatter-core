import { chai } from "meteor/practicalmeteor:chai";
import sinon from "meteor/practicalmeteor:sinon";

before(function () {
  stubs.create("userId", Meteor, "userId");
  stubs.userId.returns("id_of_user_one");
  stubs.create("userId", Meteor, "user");
  stubs.userId.returns({_id: "id_of_user_one"});

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
