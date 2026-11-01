jest.mock('../../models/user');
jest.mock('../../config/jwtProvider');
const User = require('../../models/user');
const { getUserIdFromToken } = require('../../config/jwtProvider');
const { authorization } = require('../../middlewares/authorization');
const wrapAsync = require('../../middlewares/wrapAsync');
const { response, flush } = require('../helpers.cjs');

beforeEach(() => jest.resetAllMocks());

test('BE-ACCESS-01 rejects a missing Authorization header', async () => {
  const res = response(), next = jest.fn();
  authorization({ headers: {} }, res, next);
  await flush();
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.send).toHaveBeenCalledWith({ message: 'Token not found' });
  expect(next).not.toHaveBeenCalled();
  expect(User.findById).not.toHaveBeenCalled();
});

test('BE-ACCESS-03 attaches the user excluding its password', async () => {
  const user = { _id: 'u1', email: 'qa@example.com' };
  const select = jest.fn().mockResolvedValue(user);
  User.findById.mockReturnValue({ select });
  getUserIdFromToken.mockReturnValue('u1');
  const req = { headers: { authorization: 'Bearer token-1' } }, next = jest.fn(), res = response();
  authorization(req, res, next);
  await flush();
  expect(getUserIdFromToken).toHaveBeenCalledWith('token-1');
  expect(User.findById).toHaveBeenCalledWith('u1');
  expect(select).toHaveBeenCalledWith('-password');
  expect(req.user).toEqual(user);
  expect(next).toHaveBeenCalledWith();
  expect(res.send).not.toHaveBeenCalled();
});

