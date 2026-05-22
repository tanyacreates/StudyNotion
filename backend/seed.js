// Quick seed script: creates one Student and one Instructor account
// so the app can be tested without SMTP/OTP. Idempotent — re-running won't duplicate.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Profile = require('./models/profile');

const seedAccounts = [
    {
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@test.com',
        password: 'Student@123',
        accountType: 'Student',
    },
    {
        firstName: 'Test',
        lastName: 'Instructor',
        email: 'instructor@test.com',
        password: 'Instructor@123',
        accountType: 'Instructor',
    },
];

async function run() {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    for (const acc of seedAccounts) {
        const existing = await User.findOne({ email: acc.email });
        if (existing) {
            console.log(`↺  ${acc.email} already exists (${acc.accountType}) — skipping`);
            continue;
        }

        const profile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: 'Auto-seeded test account',
            contactNumber: null,
        });

        const hashed = await bcrypt.hash(acc.password, 10);

        await User.create({
            firstName: acc.firstName,
            lastName: acc.lastName,
            email: acc.email,
            password: hashed,
            accountType: acc.accountType,
            approved: true,
            additionalDetails: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${acc.firstName}%20${acc.lastName}`,
        });

        console.log(`✅ Created ${acc.accountType}: ${acc.email} / ${acc.password}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
}

run().catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
});
