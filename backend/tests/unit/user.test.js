jest.mock('../../models/user');
jest.mock('bcryptjs');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const c = require('../../controllers/user');
const { response } = require('../helpers.cjs');
const authUser = { id: 'u1', _id: 'u1', email: 'owner@example.com' };
beforeEach(() => jest.resetAllMocks());

test('BE-MEMBER-02 appends the requested email to the authenticated board', async () => {
  const email = 'member@example.com';
  User.findByIdAndUpdate.mockResolvedValue({ ...authUser, board: [email], password: 'hash' });
  const res = response();
  await c.updateBoard({ user: authUser, body: { email } }, res);
  expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u1', { $push: { board: email } }, { new: true });
  expect(res.json).toHaveBeenCalledWith({ message: 'success', data: { ...authUser, board: [email], password: null }, email });
});

