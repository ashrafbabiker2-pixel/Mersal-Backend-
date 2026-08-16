const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    tokenId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    deviceName: {
      type: String,
      default: 'Unknown Device'
    },

    platform: {
      type: String,
      default: 'unknown'
    },

    ipAddress: {
      type: String,
      default: null
    },

    userAgent: {
      type: String,
      default: null
    },

    lastActivityAt: {
      type: Date,
      default: Date.now
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },

    revokedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.index({
  expiresAt: 1
});

module.exports = mongoose.model(
  'Session',
  sessionSchema
);
