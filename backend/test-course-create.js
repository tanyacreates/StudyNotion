// Tests the real multipart course-creation flow (incl. Cloudinary thumbnail upload),
// then exercises wishlist with the created course, and section/subsection creation.
const BASE = 'http://localhost:4000/api/v1';

let pass = 0, fail = 0;
const ok = (n, c, d='') => { if (c){console.log(`  ✅ ${n}`);pass++;} else {console.log(`  ❌ ${n} ${d}`);fail++;} };

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data=null; try { data = await res.json(); } catch(e){}
    return { status: res.status, data };
}

// a tiny valid 1x1 PNG
const PNG_1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

(async () => {
    const stamp = Date.now();

    const instrLogin = await api('POST', '/auth/login', { email:'instructor@test.com', password:'Instructor@123' });
    const instrToken = instrLogin.data?.token;
    ok('instructor login', !!instrToken);

    const studentLogin = await api('POST', '/auth/login', { email:'student@test.com', password:'Student@123' });
    const studentToken = studentLogin.data?.token;
    ok('student login', !!studentToken);

    const cats = await api('GET', '/course/showAllCategories');
    const categoryId = cats.data?.data?.[0]?._id;
    ok('have category', !!categoryId);

    // ---- create course via multipart ----
    console.log('\n=== createCourse (multipart + Cloudinary) ===');
    const fd = new FormData();
    fd.set('courseName', `E2E Multipart Course ${stamp}`);
    fd.set('courseDescription', 'Created by multipart e2e test');
    fd.set('whatYouWillLearn', 'How to test multipart uploads');
    fd.set('price', '799');
    fd.set('category', categoryId);
    fd.set('tag', JSON.stringify(['e2e','test']));
    fd.set('instructions', JSON.stringify(['Stay curious']));
    fd.set('status', 'Published');
    fd.set('thumbnailImage', new Blob([PNG_1x1], { type: 'image/png' }), 'thumb.png');

    const createRes = await fetch(BASE + '/course/createCourse', {
        method: 'POST',
        headers: { Authorization: `Bearer ${instrToken}` },
        body: fd,
    });
    const createData = await createRes.json().catch(()=>null);
    ok('createCourse success', createData?.success === true, JSON.stringify(createData).slice(0,200));
    const courseId = createData?.data?._id;
    ok('got courseId', !!courseId);

    // ---- add a section ----
    console.log('\n=== sections / subsections ===');
    let sectionId = null;
    if (courseId) {
        const sec = await api('POST', '/course/addSection', { sectionName:'Intro', courseId }, instrToken);
        ok('addSection', sec.data?.success === true, JSON.stringify(sec.data).slice(0,160));
        const updated = sec.data?.updatedCourse || sec.data?.data;
        sectionId = updated?.courseContent?.[updated.courseContent.length-1]?._id;
        ok('got sectionId', !!sectionId, JSON.stringify(sec.data?.updatedCourse?.courseContent||sec.data).slice(0,120));
    }

    // ---- wishlist with real course ----
    console.log('\n=== wishlist (real course) ===');
    if (courseId) {
        const add = await api('POST', '/profile/addToWishlist', { courseId }, studentToken);
        ok('addToWishlist', add.data?.success === true, JSON.stringify(add.data).slice(0,160));
        const get = await api('GET', '/profile/getWishlist', null, studentToken);
        ok('getWishlist contains it', Array.isArray(get.data?.data) && get.data.data.some(c=>c._id===courseId), JSON.stringify(get.data).slice(0,120));
        const rem = await api('POST', '/profile/removeFromWishlist', { courseId }, studentToken);
        ok('removeFromWishlist', rem.data?.success === true);
        const get2 = await api('GET', '/profile/getWishlist', null, studentToken);
        ok('wishlist empty after remove', Array.isArray(get2.data?.data) && !get2.data.data.some(c=>c._id===courseId));
    }

    // ---- insights reflect the new course ----
    console.log('\n=== insights reflect new course ===');
    const ins = await api('GET', '/profile/instructorInsights', null, instrToken);
    ok('insights summary.totalCourses >= 1', (ins.data?.data?.summary?.totalCourses||0) >= 1, JSON.stringify(ins.data?.data?.summary));

    console.log(`\n========== RESULT: ${pass} passed, ${fail} failed ==========\n`);
    process.exit(fail>0?1:0);
})().catch(e=>{ console.error('CRASH', e); process.exit(2); });
