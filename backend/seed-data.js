// Rich demo-data seeder for StudyNotion.
// Creates instructors, students, courses (with sections + subsections),
// ratings/reviews, enrollments and course-progress so the platform looks real.
//
// Idempotent: it removes previously seeded demo content (anything tagged with the
// @demo.studynotion.com email domain, plus their courses) before reseeding.
// The plain test accounts (student@test.com, instructor@test.com, admin@test.com)
// and their data are left untouched.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Profile = require('./models/profile');
const Category = require('./models/category');
const Course = require('./models/course');
const Section = require('./models/section');
const SubSection = require('./models/subSection');
const RatingAndReview = require('./models/ratingAndReview');
const CourseProgress = require('./models/courseProgress');

const DEMO_DOMAIN = 'demo.studynotion.com';
const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const avatar = (name) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;
// Reliable Unsplash CDN images (direct, no redirect) so thumbnails always load.
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&h=360&q=80`;

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const instructorsData = [
    { firstName: 'Aarav', lastName: 'Sharma', email: `aarav@${DEMO_DOMAIN}`, about: 'Full-stack engineer & educator with 10+ years building web apps.', headline: 'Senior Full-Stack Engineer' },
    { firstName: 'Priya', lastName: 'Verma', email: `priya@${DEMO_DOMAIN}`, about: 'Data scientist passionate about teaching ML to beginners.', headline: 'Lead Data Scientist' },
    { firstName: 'Rohan', lastName: 'Mehta', email: `rohan@${DEMO_DOMAIN}`, about: 'Mobile dev specialist — Flutter, React Native, native Android.', headline: 'Mobile Engineering Lead' },
    { firstName: 'Sara', lastName: 'Khan', email: `sara@${DEMO_DOMAIN}`, about: 'Cloud & DevOps consultant. AWS Solutions Architect.', headline: 'DevOps & Cloud Architect' },
    { firstName: 'Vikram', lastName: 'Nair', email: `vikram@${DEMO_DOMAIN}`, about: 'Product designer turned design instructor.', headline: 'Principal Product Designer' },
];

const studentsData = Array.from({ length: 14 }).map((_, i) => {
    const names = [
        ['Ananya', 'Iyer'], ['Karan', 'Gupta'], ['Meera', 'Reddy'], ['Arjun', 'Singh'],
        ['Nisha', 'Patel'], ['Dev', 'Joshi'], ['Riya', 'Das'], ['Aditya', 'Rao'],
        ['Tara', 'Bose'], ['Kabir', 'Malhotra'], ['Isha', 'Chopra'], ['Yash', 'Agarwal'],
        ['Diya', 'Menon'], ['Aryan', 'Pillai'],
    ];
    const [firstName, lastName] = names[i];
    return { firstName, lastName, email: `${firstName.toLowerCase()}.${i}@${DEMO_DOMAIN}` };
});

// course blueprints keyed by category name
const courseBlueprints = {
    'Web Development': [
        { name: 'The Complete React Bootcamp 2024', price: 1499, learn: 'Build production-grade SPAs with React, hooks, and Redux Toolkit.', tags: ['react', 'javascript', 'frontend'], img: '1633356122544-f134324a6cee' },
        { name: 'Node.js & Express REST APIs', price: 1299, learn: 'Design and ship scalable REST APIs with Node, Express and MongoDB.', tags: ['node', 'express', 'backend'], img: '1461749280684-dccba630e2f6' },
        { name: 'Full-Stack MERN Masterclass', price: 1999, learn: 'Ship a complete MERN application from scratch to deployment.', tags: ['mern', 'mongodb', 'fullstack'], img: '1517180102446-f3ece451e9d8' },
        { name: 'Modern CSS & Tailwind', price: 899, learn: 'Master responsive layouts, flexbox, grid and Tailwind CSS.', tags: ['css', 'tailwind', 'design'], img: '1507721999472-8ed4421c4af2' },
    ],
    'Data Science': [
        { name: 'Python for Data Analysis', price: 1199, learn: 'Wrangle and analyze data with pandas, NumPy and matplotlib.', tags: ['python', 'pandas', 'data'], img: '1551288049-bebda4e38f71' },
        { name: 'Machine Learning A-Z', price: 1799, learn: 'Implement regression, classification and clustering models.', tags: ['ml', 'python', 'ai'], img: '1526379095098-d400fd0bf935' },
        { name: 'Deep Learning with PyTorch', price: 1999, learn: 'Build and train neural networks for vision and NLP.', tags: ['deeplearning', 'pytorch', 'ai'], img: '1555949963-aa79dcee981c' },
    ],
    'Mobile Development': [
        { name: 'Flutter & Dart: Build iOS and Android Apps', price: 1599, learn: 'Create beautiful cross-platform apps with Flutter.', tags: ['flutter', 'dart', 'mobile'], img: '1607252650355-f7fd0460ccdb' },
        { name: 'React Native: From Zero to Store', price: 1499, learn: 'Build and publish React Native apps to both app stores.', tags: ['reactnative', 'mobile', 'javascript'], img: '1512941937669-90a1b58e7e9c' },
    ],
    'DevOps': [
        { name: 'Docker & Kubernetes Deep Dive', price: 1699, learn: 'Containerize apps and orchestrate them with Kubernetes.', tags: ['docker', 'kubernetes', 'devops'], img: '1605745341112-85968b19335b' },
        { name: 'CI/CD with GitHub Actions', price: 1099, learn: 'Automate build, test and deploy pipelines.', tags: ['cicd', 'github', 'automation'], img: '1593720219276-0b1eacd0aef4' },
        { name: 'AWS Certified Solutions Architect Prep', price: 1899, learn: 'Prepare for the AWS SAA-C03 certification.', tags: ['aws', 'cloud', 'certification'], img: '1558494949-ef010cbdcc31' },
    ],
    'Design': [
        { name: 'UI/UX Design Fundamentals', price: 1299, learn: 'Learn user research, wireframing and prototyping in Figma.', tags: ['uiux', 'figma', 'design'], img: '1581291518857-4e27b48ff24e' },
        { name: 'Design Systems with Figma', price: 1399, learn: 'Build scalable, reusable component libraries.', tags: ['figma', 'designsystem', 'ui'], img: '1561070791-2526d30994b5' },
    ],
};

const sectionTemplates = [
    { name: 'Getting Started', subs: ['Course Introduction', 'Setting Up Your Environment', 'Project Overview'] },
    { name: 'Core Concepts', subs: ['Fundamentals Explained', 'Hands-on Walkthrough', 'Common Pitfalls'] },
    { name: 'Building the Project', subs: ['Project Scaffolding', 'Implementing Features', 'Connecting the Pieces'] },
    { name: 'Advanced Topics', subs: ['Performance Tips', 'Testing & Debugging', 'Best Practices'] },
    { name: 'Wrapping Up', subs: ['Deployment', 'Next Steps', 'Course Summary'] },
];

const reviewTexts = [
    'Absolutely loved this course! The instructor explains everything clearly.',
    'Great content and well structured. Highly recommended.',
    'Very practical and hands-on. Learned a lot.',
    'Good course but could use more exercises.',
    'One of the best courses I have taken on this topic.',
    'Clear, concise and to the point. Worth every rupee.',
    'The projects really helped solidify the concepts.',
    'Excellent pacing and depth. Five stars!',
];

async function findOrCreateUser({ firstName, lastName, email, about, accountType }) {
    // Reuse an existing demo user (keeps their _id so tokens/sessions stay valid).
    const existing = await User.findOne({ email });
    if (existing) return existing;

    const profile = await Profile.create({
        gender: rnd(['Male', 'Female', 'Prefer not to say']),
        dateOfBirth: '1995-01-01',
        about: about || 'Lifelong learner on StudyNotion.',
        contactNumber: 9000000000 + Math.floor(Math.random() * 99999999),
    });
    const hashed = await bcrypt.hash('Demo@123', 10);
    return User.create({
        firstName, lastName, email, password: hashed, accountType,
        approved: true, additionalDetails: profile._id, image: avatar(`${firstName} ${lastName}`),
    });
}

async function run() {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB\n');

    // ---- cleanup previous demo data ----
    console.log('Cleaning previous demo data...');
    const demoUsers = await User.find({ email: { $regex: `@${DEMO_DOMAIN}$` } }).select('_id additionalDetails courses');
    const demoUserIds = demoUsers.map((u) => u._id);
    const demoCourses = await Course.find({ instructor: { $in: demoUserIds } }).select('_id courseContent ratingAndReviews');

    // gather section + subsection ids to delete
    const courseIds = demoCourses.map((c) => c._id);
    const sectionIds = demoCourses.flatMap((c) => c.courseContent);
    const sections = await Section.find({ _id: { $in: sectionIds } }).select('subSection');
    const subSectionIds = sections.flatMap((s) => s.subSection);

    // NOTE: we wipe only course-related content. Demo USERS are preserved (upserted
    // by email below) so existing logged-in sessions/tokens remain valid across reseeds.
    await SubSection.deleteMany({ _id: { $in: subSectionIds } });
    await Section.deleteMany({ _id: { $in: sectionIds } });
    await RatingAndReview.deleteMany({ course: { $in: courseIds } });
    await CourseProgress.deleteMany({ courseID: { $in: courseIds } });
    await Course.deleteMany({ _id: { $in: courseIds } });
    await Category.updateMany({}, { $pull: { courses: { $in: courseIds } } });
    // reset demo users' enrolled-courses / progress (they pointed at now-deleted courses)
    await User.updateMany({ _id: { $in: demoUserIds } }, { $set: { courses: [], courseProgress: [] } });
    console.log(`Removed ${courseIds.length} demo courses (users preserved).\n`);

    // ---- find-or-create instructors & students (preserve _id across reseeds) ----
    console.log('Upserting instructors and students...');
    const instructors = [];
    for (const i of instructorsData) instructors.push(await findOrCreateUser({ ...i, accountType: 'Instructor' }));
    const students = [];
    for (const s of studentsData) students.push(await findOrCreateUser({ ...s, accountType: 'Student' }));
    console.log(`Ready: ${instructors.length} instructors, ${students.length} students.\n`);

    const categories = await Category.find({});
    const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

    // ---- create courses ----
    console.log('Creating courses with sections, reviews and enrollments...');
    let courseCount = 0, reviewCount = 0, enrollCount = 0;

    for (const [catName, blueprints] of Object.entries(courseBlueprints)) {
        const category = categoryByName[catName];
        if (!category) continue;

        for (const bp of blueprints) {
            const instructor = rnd(instructors);

            // build sections + subsections
            const chosenSections = sample(sectionTemplates, 3 + Math.floor(Math.random() * 2));
            const sectionDocs = [];
            for (const st of chosenSections) {
                const subDocs = [];
                for (const subTitle of st.subs) {
                    const sub = await SubSection.create({
                        title: subTitle,
                        timeDuration: String(180 + Math.floor(Math.random() * 600)),
                        description: `${subTitle} — part of the "${st.name}" section.`,
                        videoUrl: SAMPLE_VIDEO,
                    });
                    subDocs.push(sub._id);
                }
                const section = await Section.create({ sectionName: st.name, subSection: subDocs });
                sectionDocs.push(section._id);
            }

            // enroll a random set of students
            const enrolled = sample(students, 3 + Math.floor(Math.random() * 8));

            const course = await Course.create({
                courseName: bp.name,
                courseDescription: `${bp.learn} This course is designed for all levels and packed with real-world projects.`,
                instructor: instructor._id,
                whatYouWillLearn: bp.learn,
                courseContent: sectionDocs,
                price: bp.price,
                thumbnail: img(bp.img),
                category: category._id,
                tag: bp.tags,
                instructions: ['Basic computer skills', 'A willingness to learn', 'No prior experience required'],
                status: 'Published',
                studentsEnrolled: enrolled.map((s) => s._id),
                createdAt: Date.now(),
            });
            courseCount++;

            // link to category and instructor
            await Category.findByIdAndUpdate(category._id, { $push: { courses: course._id } });
            await User.findByIdAndUpdate(instructor._id, { $push: { courses: course._id } });

            // enroll: add course to each student + create progress
            for (const stu of enrolled) {
                await User.findByIdAndUpdate(stu._id, { $push: { courses: course._id } });
                // mark some videos complete
                const completed = sample(
                    (await Section.find({ _id: { $in: sectionDocs } })).flatMap((s) => s.subSection),
                    Math.floor(Math.random() * 4)
                );
                const cp = await CourseProgress.create({ courseID: course._id, userId: stu._id, completedVideos: completed });
                await User.findByIdAndUpdate(stu._id, { $push: { courseProgress: cp._id } });
                enrollCount++;
            }

            // ratings & reviews from a subset of enrolled students
            const reviewers = sample(enrolled, Math.min(enrolled.length, 2 + Math.floor(Math.random() * 4)));
            const reviewIds = [];
            for (const rev of reviewers) {
                const r = await RatingAndReview.create({
                    user: rev._id,
                    rating: String(3 + Math.floor(Math.random() * 3)), // 3..5
                    review: rnd(reviewTexts),
                    course: course._id,
                });
                reviewIds.push(r._id);
                reviewCount++;
            }
            await Course.findByIdAndUpdate(course._id, { $push: { ratingAndReviews: { $each: reviewIds } } });
        }
    }

    console.log(`\nCreated ${courseCount} courses, ${reviewCount} reviews, ${enrollCount} enrollments.`);
    console.log('\nAll demo accounts use password: Demo@123');
    console.log('Example instructor login:', instructorsData[0].email);
    console.log('Example student login:   ', studentsData[0].email);

    await mongoose.disconnect();
    console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
