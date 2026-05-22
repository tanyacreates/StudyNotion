import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { VscHeartFilled, VscTrash } from "react-icons/vsc"
import { FiShoppingCart } from "react-icons/fi"

import {
  getWishlist,
  removeFromWishlist,
} from "../../../services/operations/wishlistAPI"
import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import Img from "../../common/Img"
import { toast } from "react-hot-toast"


export default function Wishlist() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { wishlist } = useSelector((state) => state.wishlist)

  useEffect(() => {
    if (token) {
      dispatch(getWishlist(token))
    }
  }, [token, dispatch])

  const handleMoveToCart = (course) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    dispatch(addToCart(course))
    dispatch(removeFromWishlist(token, course._id))
  }

  const handleRemove = (courseId) => {
    dispatch(removeFromWishlist(token, courseId))
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-richblack-5">
        <VscHeartFilled className="text-6xl text-pink-200 mb-4" />
        <p className="text-3xl font-boogaloo">Your wishlist is empty</p>
        <p className="text-richblack-300 mt-2">
          Add courses you love and revisit them anytime.
        </p>
        <button
          onClick={() => navigate("/catalog/web-development")}
          className="mt-6 bg-yellow-50 hover:bg-yellow-25 text-richblack-900 font-semibold px-6 py-2 rounded-md"
        >
          Browse Courses
        </button>
      </div>
    )
  }

  return (
    <div className="text-richblack-5">
      <h1 className="text-4xl font-boogaloo text-center sm:text-left mb-6">
        My Wishlist
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {wishlist.map((course) => (
          <div
            key={course._id}
            className="flex flex-col bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden hover:border-yellow-50 transition-all"
          >
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <Img
                src={course.thumbnail}
                alt={course.courseName}
                className="h-44 w-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
              <p
                className="text-lg font-semibold cursor-pointer hover:text-yellow-50"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                {course.courseName}
              </p>
              {course.instructor && (
                <p className="text-sm text-richblack-300">
                  By {course.instructor.firstName} {course.instructor.lastName}
                </p>
              )}
              <p className="text-richblack-100 text-sm">
                {course.courseDescription?.length > 80
                  ? `${course.courseDescription.slice(0, 80)}...`
                  : course.courseDescription}
              </p>
              <p className="text-yellow-50 font-bold text-xl mt-1">
                Rs. {course.price}
              </p>

              <div className="flex gap-3 mt-auto pt-3">
                <button
                  onClick={() => handleMoveToCart(course)}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-25 text-richblack-900 font-semibold px-3 py-2 rounded-md"
                >
                  <FiShoppingCart /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(course._id)}
                  className="flex items-center justify-center gap-2 bg-richblack-700 hover:bg-pink-700 text-richblack-5 px-3 py-2 rounded-md"
                  title="Remove from wishlist"
                >
                  <VscTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
