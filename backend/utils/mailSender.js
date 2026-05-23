const nodemailer = require('nodemailer');

// Cache the transporter so we don't recreate (and re-auth) on every email.
let cachedTransporter = null;
let usingEthereal = false;

const PLACEHOLDER_USERS = new Set([
    'placeholder@example.com',
    '',
    undefined,
    null,
]);

function isPlaceholderConfig() {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    if (PLACEHOLDER_USERS.has(user)) return true;
    if (!pass || pass === 'placeholder_app_password') return true;
    if (!process.env.MAIL_HOST) return true;
    return false;
}

async function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    if (isPlaceholderConfig()) {
        // No real SMTP creds — spin up a free Ethereal test account so emails
        // actually "send" and are viewable via a preview URL (printed to console).
        const testAccount = await nodemailer.createTestAccount();
        cachedTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        usingEthereal = true;
        console.log('📧 [mailSender] Using Ethereal test SMTP. Emails are NOT delivered to real inboxes;');
        console.log('   open the "Preview URL" logged after each send to view them.');
        return cachedTransporter;
    }

    // Real SMTP (e.g. Gmail). service:'gmail' handles host/port/secure correctly.
    const isGmail = (process.env.MAIL_HOST || '').includes('gmail');
    cachedTransporter = nodemailer.createTransport(
        isGmail
            ? {
                  service: 'gmail',
                  auth: {
                      user: process.env.MAIL_USER,
                      pass: process.env.MAIL_PASS,
                  },
              }
            : {
                  host: process.env.MAIL_HOST,
                  port: Number(process.env.MAIL_PORT) || 587,
                  secure: Number(process.env.MAIL_PORT) === 465,
                  auth: {
                      user: process.env.MAIL_USER,
                      pass: process.env.MAIL_PASS,
                  },
              }
    );
    return cachedTransporter;
}

const mailSender = async (email, title, body) => {
    try {
        const transporter = await getTransporter();

        const info = await transporter.sendMail({
            from: process.env.MAIL_USER && !isPlaceholderConfig()
                ? `StudyNotion <${process.env.MAIL_USER}>`
                : 'StudyNotion <no-reply@studynotion.test>',
            to: email,
            subject: title,
            html: body,
        });

        if (usingEthereal) {
            const preview = nodemailer.getTestMessageUrl(info);
            console.log(`📧 [mailSender] Sent "${title}" to ${email}. Preview: ${preview}`);
        }

        return info;
    } catch (error) {
        console.log('Error while sending mail (mailSender) ->', error.message);
        // Re-throw so callers can decide; sendOTP already wraps this in try/catch.
        // (Returning undefined previously hid failures.)
        throw error;
    }
};

module.exports = mailSender;
