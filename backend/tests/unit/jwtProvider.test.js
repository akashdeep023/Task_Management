const jwt = require('jsonwebtoken');
const { generateToken, getUserIdFromToken } = require('../../config/jwtProvider');
afterEach(() => jest.restoreAllMocks());

test('BE-JWT-01 round-trips a user identifier through a signed JWT', () => {
  expect(getUserIdFromToken(generateToken('user-123'))).toBe('user-123');
});

