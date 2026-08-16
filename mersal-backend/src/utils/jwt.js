const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (user, sessionId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not configured'
    );
  }

  const tokenId = crypto.randomUUID();

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      sessionId,
      tokenId
    },
    secret,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || '7d'
    }
  );

  return {
    token,
    tokenId
  };
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not configured'
    );
  }

  return jwt.verify(
    token,
    secret
  );
};

module.exports = {
  generateToken,
  verifyToken
};
