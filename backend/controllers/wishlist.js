const User = require('../models/user');
const Course = require('../models/course');


// ================ Add to Wishlist ================
exports.addToWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'courseId is required'
            });
        }

        // verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // already in wishlist?
        if (user.wishlist.some((id) => id.toString() === courseId.toString())) {
            return res.status(200).json({
                success: true,
                message: 'Course already in wishlist',
                wishlist: user.wishlist
            });
        }

        user.wishlist.push(courseId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Course added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.log('Error while adding to wishlist', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while adding to wishlist'
        });
    }
};


// ================ Remove from Wishlist ================
exports.removeFromWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'courseId is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: courseId } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Course removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.log('Error while removing from wishlist', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while removing from wishlist'
        });
    }
};


// ================ Get Wishlist ================
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate({
            path: 'wishlist',
            populate: {
                path: 'instructor',
                select: 'firstName lastName email image'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: user.wishlist,
            message: 'Wishlist fetched successfully'
        });
    } catch (error) {
        console.log('Error while fetching wishlist', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching wishlist'
        });
    }
};
