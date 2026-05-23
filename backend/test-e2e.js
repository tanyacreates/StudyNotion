// End-to-end API smoke test for StudyNotion.
// Hits the live backend on :4000 and walks the major README features.
const BASE = 'http://localhost:4000/api/v1';

let pass = 0, fail = 0;
function ok(name, cond, detail = '') {
    if (cond) { console.log(`  ✅ ${name}`); pass++; }
    else { console.log(`  ❌ ${name} ${detail}`); fail++; }
}

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, data };
}

(async () => {
    const stamp = Date.now();
    const studentEmail = `e2e.student.${stamp}@test.com`;
    const password = 'Test@1234';

    console.log('\n=== AUTH: signup via OTP ===');
    const sendOtp = await api('POST', '/auth/sendotp', { email: studentEmail });
    ok('sendotp returns success', sendOtp.data?.success === true, JSON.stringify(sendOtp.data));
    const otp = sendOtp.data?.otp;
    ok('sendotp returns an OTP', !!otp);

    const signup = await api('POST', '/auth/signup', {
        firstName: 'E2E', lastName: 'Student', email: studentEmail,
        password, confirmPassword: password, accountType: 'Student', otp,
    });
    ok('signup succeeds', signup.data?.success === true, JSON.stringify(signup.data));

    console.log('\n=== AUTH: login (new + seeded) ===');
    const login = await api('POST', '/auth/login', { email: studentEmail, password });
    ok('login new student', login.data?.success === true, JSON.stringify(login.data));
    const studentToken = login.data?.token;

    const instrLogin = await api('POST', '/auth/login', { email: 'instructor@test.com', password: 'Instructor@123' });
    ok('login seeded instructor', instrLogin.data?.success === true, JSON.stringify(instrLogin.data));
    const instrToken = instrLogin.data?.token;

    console.log('\n=== PROFILE ===');
    const userDetails = await api('GET', '/profile/getUserDetails', null, studentToken);
    ok('getUserDetails', userDetails.data?.success === true, JSON.stringify(userDetails.data).slice(0,120));

    console.log('\n=== CATEGORIES ===');
    let cats = await api('GET', '/course/showAllCategories');
    ok('showAllCategories responds', cats.status === 200, JSON.stringify(cats.data).slice(0,120));
    let categoryId = cats.data?.data?.[0]?._id;
    if (!categoryId) {
        // create one
        const created = await api('POST', '/course/createCategory',
            { name: 'Web Development', description: 'Web dev courses' }, instrToken);
        console.log('    (created category:', JSON.stringify(created.data).slice(0,100), ')');
        cats = await api('GET', '/course/showAllCategories');
        categoryId = cats.data?.data?.[0]?._id;
    }
    ok('have a categoryId', !!categoryId, '— need a category to create courses');

    console.log('\n=== COURSE create (instructor) ===');
    let courseId = null;
    if (categoryId) {
        const createCourse = await api('POST', '/course/createCourse', {
            courseName: `E2E Course ${stamp}`,
            courseDescription: 'A course created by the e2e test',
            whatYouWillLearn: 'Testing',
            price: 499,
            category: categoryId,
            tag: JSON.stringify(['test']),
            instructions: JSON.stringify(['Be curious']),
            status: 'Published',
        }, instrToken);
        ok('createCourse', createCourse.data?.success === true, JSON.stringify(createCourse.data).slice(0,160));
        courseId = createCourse.data?.data?._id;
    }

    const allCourses = await api('GET', '/course/getAllCourses');
    ok('getAllCourses', allCourses.data?.success === true, JSON.stringify(allCourses.data).slice(0,120));

    console.log('\n=== WISHLIST (student) ===');
    if (courseId) {
        const add = await api('POST', '/profile/addToWishlist', { courseId }, studentToken);
        ok('addToWishlist', add.data?.success === true, JSON.stringify(add.data).slice(0,160));
        const get = await api('GET', '/profile/getWishlist', null, studentToken);
        ok('getWishlist contains course', Array.isArray(get.data?.data) && get.data.data.some(c => c._id === courseId), JSON.stringify(get.data).slice(0,160));
        const rem = await api('POST', '/profile/removeFromWishlist', { courseId }, studentToken);
        ok('removeFromWishlist', rem.data?.success === true, JSON.stringify(rem.data).slice(0,160));
    } else {
        console.log('  ⚠ skipped wishlist (no courseId)');
    }

    console.log('\n=== INSIGHTS (instructor) ===');
    const insights = await api('GET', '/profile/instructorInsights', null, instrToken);
    ok('instructorInsights success', insights.data?.success === true, JSON.stringify(insights.data).slice(0,160));
    ok('insights has summary', !!insights.data?.data?.summary);

    console.log('\n=== INSTRUCTOR DASHBOARD ===');
    const dash = await api('GET', '/profile/instructorDashboard', null, instrToken);
    ok('instructorDashboard responds', dash.status === 200, JSON.stringify(dash.data).slice(0,120));

    console.log(`\n========== RESULT: ${pass} passed, ${fail} failed ==========\n`);
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('TEST CRASHED:', e); process.exit(2); });
