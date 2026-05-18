require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await Transaction.deleteMany({ user: { $exists: false } });
  console.log(`Deleted ${result.deletedCount} legacy transaction(s) without user ownership.`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (disconnectErr) {
    console.error(disconnectErr);
  }
  process.exit(1);
});