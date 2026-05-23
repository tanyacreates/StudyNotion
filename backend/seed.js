// Quick seed script: creates Student/Instructor/Admin accounts and default catalog
// categories so the app is usable without SMTP/OTP. Idempotent — safe to re-run.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Profile = require('./models/profile');
const Category = require('./models/category');

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
    {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: 'Admin@123',
        accountType: 'Admin',
    },
];

// Default catalog categories — without these, no courses can be created or browsed.
const seedCategories = [
    { name: 'Web Development', description: 'Frontend, backend and full-stack web courses' },
    { name: 'Data Science', description: 'Data analysis, ML and AI courses' },
    { name: 'Mobile Development', description: 'Android, iOS and cross-platform courses' },
    { name: 'DevOps', description: 'CI/CD, cloud and infrastructure courses' },
    { name: 'Design', description: 'UI/UX and graphic design courses' },
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

    for (const cat of seedCategories) {
        const existing = await Category.findOne({ name: cat.name });
        if (existing) {
            console.log(`↺  Category "${cat.name}" already exists — skipping`);
            continue;
        }
        await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
}

run().catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
});
