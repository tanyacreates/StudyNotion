import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { VscHistory } from "react-icons/vsc"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import Img from "../../common/Img"

export default function PurchaseHistory() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [courses, setCourses] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getUserEnrolledCourses(token)
        setCourses(res || [])
      } catch (e) {
        setCourses([])
      }
    })()
  }, [token])

  // skeleton
  const skItem = () => (
    <div className="flex border border-richblack-700 px-5 py-3 w-full">
      <div className="flex flex-1 gap-x-4">
        <div className="h-14 w-14 rounded-lg skeleton"></div>
        <div className="flex flex-col w-[40%]">
          <p className="h-2 w-[50%] rounded-xl skeleton"></p>
          <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
        </div>
      </div>
    </div>
  )

  if (courses && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-richblack-5">
        <VscHistory className="text-6xl text-richblack-300 mb-4" />
        <p className="text-3xl font-boogaloo">No purchases yet</p>
        <p className="text-richblack-300 mt-2">
          Courses you buy will appear here as your purchase history.
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
      <h1 className="text-4xl font-boogaloo text-center sm:text-left mb-2">
        Purchase History
      </h1>
      <p className="text-richblack-300 mb-6">All the courses you have enrolled in.</p>

      <div className="my-2 text-richblack-5 rounded-2xl border border-richblack-700 overflow-hidden">
        {/* Headings */}
        <div className="flex bg-richblack-800">
          <p className="w-[45%] px-5 py-3 font-semibold">Course</p>
          <p className="w-1/4 px-2 py-3 font-semibold">Category</p>
          <p className="flex-1 px-2 py-3 font-semibold">Price</p>
        </div>

        {!courses && (
          <div>
            {skItem()}
            {skItem()}
            {skItem()}
          </div>
        )}

        {courses?.map((course, i, arr) => (
          <div
            key={course._id}
            className={`flex flex-col sm:flex-row sm:items-center border-t border-richblack-700 ${
              i === arr.length - 1 ? "" : ""
            }`}
          >
            <div
              className="flex sm:w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <Img
                src={course.thumbnail}
                alt={course.courseName}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex max-w-xs flex-col gap-1">
                <p className="font-semibold">{course.courseName}</p>
                <p className="text-xs text-richblack-300">
                  {course.courseDescription?.length > 50
                    ? `${course.courseDescription.slice(0, 50)}...`
                    : course.courseDescription}
                </p>
              </div>
            </div>

            <div className="sm:w-1/4 px-5 sm:px-2 py-3 text-richblack-100">
              {course.category?.name || "—"}
            </div>

            <div className="flex-1 px-5 sm:px-2 py-3 text-yellow-50 font-semibold">
              {course.price ? `Rs. ${course.price}` : "Free"}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
