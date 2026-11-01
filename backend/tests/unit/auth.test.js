// MongoDB, password hashing and token generation are external to this controller.
jest.mock('../../models/user');
jest.mock('bcryptjs');
jest.mock('../../config/jwtProvider');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../config/jwtProvider');
const { registerUser, loginUser } = require('../../controllers/auth');
const { response } = require('../helpers.cjs');

beforeEach(() => jest.resetAllMocks());

test('BE-AUTH-01 registers a new user with a hashed password and token', async () => {
  const save = jest.fn().mockResolvedValue({ _id: 'user-1' });
  User.findOne.mockResolvedValue(null);
  User.mockImplementation(() => ({ save }));
  bcrypt.hashSync.mockReturnValue('hashed-password');
  generateToken.mockReturnValue('signed-token');
  const res = response();
  await registerUser({ body: { name: 'Luis', email: 'qa@example.com', password: 'Test123!' } }, res);
  expect(User).toHaveBeenCalledWith({ name: 'Luis', email: 'qa@example.com', password: 'hashed-password' });
  expect(bcrypt.hashSync).toHaveBeenCalledWith('Test123!', 8);
  expect(save).toHaveBeenCalledTimes(1);
  expect(generateToken).toHaveBeenCalledWith('user-1');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: 'Registration Successfully', token: 'signed-token' });
});

test('BE-AUTH-02 rejects a duplicate email without saving or generating a token', async () => {
  User.findOne.mockResolvedValue({ _id: 'existing' });
  const res = response();
  await registerUser({ body: { email: 'existing@example.com' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ message: 'User Already Exist' });
  expect(User).not.toHaveBeenCalled();
  expect(bcrypt.hashSync).not.toHaveBeenCalled();
  expect(generateToken).not.toHaveBeenCalled();
});

test('BE-AUTH-05 rejects an incorrect password without issuing a token', async () => {
  User.findOne.mockResolvedValue({ _id: 'u1', password: 'stored-hash' });
  bcrypt.compareSync.mockReturnValue(false);
  const res = response();
  await loginUser({ body: { email: 'qa@example.com', password: 'wrong' } }, res);
  expect(bcrypt.compareSync).toHaveBeenCalledWith('wrong', 'stored-hash');
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect Password' });
  expect(generateToken).not.toHaveBeenCalled();
});

test('BE-AUTH-06 logs in and removes the password from the response', async () => {
  const user = { _id: 'u1', email: 'qa@example.com', password: 'stored-hash' };
  User.findOne.mockResolvedValue(user);
  bcrypt.compareSync.mockReturnValue(true);
  generateToken.mockReturnValue('token-1');
  const res = response();
  await loginUser({ body: { email: user.email, password: 'Test123!' } }, res);
  expect(generateToken).toHaveBeenCalledWith('u1');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: 'Login Successfully', data: { ...user, password: null }, token: 'token-1' });
});

