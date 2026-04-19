require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Order    = require('../models/Order');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }

  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected');

  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Order.deleteMany({});

  console.log('👤 Creating users...');
  // Use create() so pre-save hook hashes passwords
  const admin = await User.create({
    name: 'Admin MediRush', email: 'admin@medirush.com',
    password: 'admin123', role: 'admin', phone: '9999999999',
  });
  const user1 = await User.create({
    name: 'Raj Kumar', email: 'raj@example.com',
    password: 'user123', role: 'user', phone: '9876543210',
    address: 'Sector 21, Chandigarh',
  });
  const user2 = await User.create({
    name: 'Priya Singh', email: 'priya@example.com',
    password: 'user123', role: 'user', phone: '9876543211',
    address: 'Model Town, Bathinda',
  });
  const delivery1 = await User.create({
    name: 'Arjun Sharma', email: 'arjun@medirush.com',
    password: 'delivery123', role: 'delivery', phone: '9988776655',
  });

  console.log('📦 Creating sample orders...');
  await Order.create([
    {
      user: user1._id,
      medicines: 'Insulin 100 IU × 3 vials — ICU patient critical need',
      urgencyLevel: 'critical',
      deliveryAddress: 'Sector 21, Chandigarh',
      notes: 'ICU patient needs insulin immediately',
      status: 'pending',
      statusHistory: [{ status: 'pending', updatedBy: user1._id }],
    },
    {
      user: user2._id,
      medicines: 'Paracetamol 500mg × 10, Crocin 650mg × 5',
      urgencyLevel: 'medium',
      deliveryAddress: 'Model Town, Bathinda',
      notes: 'High fever since morning',
      status: 'in_transit',
      deliveryPartner: delivery1._id,
      statusHistory: [
        { status: 'pending',    updatedBy: user2._id },
        { status: 'accepted',   updatedBy: delivery1._id },
        { status: 'picked',     updatedBy: delivery1._id },
        { status: 'in_transit', updatedBy: delivery1._id },
      ],
    },
    {
      user: user1._id,
      medicines: 'Amlodipine 5mg × 30 tablets — Blood pressure',
      urgencyLevel: 'high',
      deliveryAddress: 'Sector 21, Chandigarh',
      notes: 'Urgent — patient feeling dizzy',
      status: 'delivered',
      deliveryPartner: delivery1._id,
      actualDelivery: new Date(),
      statusHistory: [
        { status: 'pending',   updatedBy: user1._id },
        { status: 'accepted',  updatedBy: delivery1._id },
        { status: 'delivered', updatedBy: delivery1._id },
      ],
    },
  ]);

  console.log('\n✅ Seed complete!\n');
  console.log('═══════════════════════════════════════');
  console.log('  Demo Accounts:');
  console.log('  Admin:    admin@medirush.com  / admin123');
  console.log('  User:     raj@example.com     / user123');
  console.log('  User:     priya@example.com   / user123');
  console.log('  Delivery: arjun@medirush.com  / delivery123');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
