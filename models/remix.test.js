/* This file tests the model methods for the Remix model, tests the robustness and correctness of operations regarding Remix data
like returning detailed information on a remix, adding a remix, updating remix data, etc. */

const {NotFoundError, BadRequestError, UnauthorizedError} = require("../errors/errors.js");
const db = require("../db.js");
const Remix = require("./remix.js");
const {commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

