const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");

// controllers
const {
    updateProfile,
    updateUserProfileImage,
    getUserDetails,
    getEnrolledCourses,
    deleteAccount,
    instructorDashboard,
    instructorInsights
} = require('../controllers/profile');

const {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require('../controllers/wishlist');


// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete User Account
router.delete('/deleteProfile', auth, deleteAccount);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getUserDetails);


// Get Enrolled Courses
router.get('/getEnrolledCourses', auth, getEnrolledCourses);

// update profile image
router.put('/updateUserProfileImage', auth, updateUserProfileImage);

// instructor Dashboard Details
router.get('/instructorDashboard', auth, isInstructor, instructorDashboard);

// instructor detailed Insights (views, ratings, revenue trends)
router.get('/instructorInsights', auth, isInstructor, instructorInsights);


// ********************************************************************************************************
//                                      Wishlist routes
// ********************************************************************************************************
router.get('/getWishlist', auth, getWishlist);
router.post('/addToWishlist', auth, addToWishlist);
router.post('/removeFromWishlist', auth, removeFromWishlist);



module.exports = router;
