const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    unique: true,
    required: [true, 'Please add an email']
  },
  password: {
    type: String,
    minlength: 6,
    required: [true, 'Please add a password'],
    select: false // Don't return password by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }

  const bcryptHashPattern = /^\$2[aby]\$\d{2}\$.{53}$/;
  if (!bcryptHashPattern.test(this.password)) {
    return enteredPassword === this.password;
  }

  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
