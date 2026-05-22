import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  wishlist: localStorage.getItem("wishlist")
    ? JSON.parse(localStorage.getItem("wishlist"))
    : [],
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.wishlist = action.payload || []
      localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
    },
    addCourseToWishlist: (state, action) => {
      const course = action.payload
      const exists = state.wishlist.find((c) => c._id === course._id)
      if (!exists) {
        state.wishlist.push(course)
        localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
      }
    },
    removeCourseFromWishlist: (state, action) => {
      const courseId = action.payload
      state.wishlist = state.wishlist.filter((c) => c._id !== courseId)
      localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
    },
    resetWishlist: (state) => {
      state.wishlist = []
      localStorage.removeItem("wishlist")
    },
  },
})

export const {
  setWishlist,
  addCourseToWishlist,
  removeCourseFromWishlist,
  resetWishlist,
} = wishlistSlice.actions

export default wishlistSlice.reducer
