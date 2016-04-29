import { chai } from "meteor/practicalmeteor:chai";
import { resetDatabase } from "meteor/xolvio:cleaner";

before(function() {
  //create stub for findOne method
  stubs.create("findOne", Meteor.users, "findOne");

  stubs.findOne.returns({
    _id: "id_of_user_one",
    username: "user_one_nickname"
  });

  stubs.findOne.withArgs({_id: "id_of_user_one"}).returns({
    _id: "id_of_user_one",
    username: "user_one_nickname"
  });

  stubs.findOne.withArgs({_id: "id_of_user_two"}).returns({
    _id: "id_of_user_two",
    username: "user_two_nickname"
  });
});

after(function() {
  resetDatabase();
});

import { modelTests } from "./server-tests/models.tests.js";
import { apiTests } from "./server-tests/api.tests.js";
import { methodTests } from "./server-tests/methods.tests.js";
