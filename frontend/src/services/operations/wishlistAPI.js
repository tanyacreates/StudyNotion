import { toast } from "react-hot-toast"

import { apiConnector } from "../apiConnector"
import { wishlistEndpoints } from "../apis"
import {
  setWishlist,
  addCourseToWishlist,
  removeCourseFromWishlist,
} from "../../slices/wishlistSlice"

const {
  GET_WISHLIST_API,
  ADD_TO_WISHLIST_API,
  REMOVE_FROM_WISHLIST_API,
} = wishlistEndpoints


// ================ get Wishlist ================
export function getWishlist(token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("GET", GET_WISHLIST_API, null, {
        Authorization: `Bearer ${token}`,
      })
      if (!response.data.success) throw new Error(response.data.message)
      dispatch(setWishlist(response.data.data))
      return response.data.data
    } catch (error) {
      console.log("GET_WISHLIST_API ERROR............", error)
      toast.error("Could not fetch wishlist")
      return []
    }
  }
}


// ================ add To Wishlist ================
export function addToWishlist(token, course) {
  return async (dispatch) => {
    const toastId = toast.loading("Adding to wishlist...")
    try {
      const response = await apiConnector(
        "POST",
        ADD_TO_WISHLIST_API,
        { courseId: course._id },
        { Authorization: `Bearer ${token}` }
      )
      if (!response.data.success) throw new Error(response.data.message)
      dispatch(addCourseToWishlist(course))
      toast.success("Added to wishlist")
    } catch (error) {
      console.log("ADD_TO_WISHLIST_API ERROR............", error)
      toast.error("Could not add to wishlist")
    }
    toast.dismiss(toastId)
  }
}


// ================ remove From Wishlist ================
export function removeFromWishlist(token, courseId) {
  return async (dispatch) => {
    const toastId = toast.loading("Removing from wishlist...")
    try {
      const response = await apiConnector(
        "POST",
        REMOVE_FROM_WISHLIST_API,
        { courseId },
        { Authorization: `Bearer ${token}` }
      )
      if (!response.data.success) throw new Error(response.data.message)
      dispatch(removeCourseFromWishlist(courseId))
      toast.success("Removed from wishlist")
    } catch (error) {
      console.log("REMOVE_FROM_WISHLIST_API ERROR............", error)
      toast.error("Could not remove from wishlist")
    }
    toast.dismiss(toastId)
  }
}
