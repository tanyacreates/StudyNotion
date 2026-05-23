const express = require('express')
const app = express();

// packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');


// middleware
app.use(express.json()); // to parse json body
app.use(cookieParser());
app.use(
    cors({
        // origin: 'http://localhost:5173', // frontend link
        origin: "*",
        credentials: true
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp'
    })
)


// connections
connectDB();
cloudinaryConnect();

// mount route
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);


// Default Route
app.get('/', (req, res) => {
    res.send(`<div>
    This is Default Route
    <p>Everything is OK</p>
    </div>`);
})


const PORT = process.env.PORT || 5000;

// Only start a listening server in non-serverless (local) environments.
// On Vercel the platform invokes the exported app as a serverless function,
// so calling app.listen() there is incorrect and causes the function to crash.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server Started on PORT ${PORT}`);
    });
}

// Export the app so Vercel's @vercel/node runtime can use it as the handler.
module.exports = app;
