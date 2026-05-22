import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import {
  VscEye,
  VscMortarBoard,
  VscStarFull,
  VscBook,
  VscFeedback,
} from "react-icons/vsc"
import { FaRupeeSign } from "react-icons/fa"

import { getInstructorInsights } from "../../../services/operations/profileAPI"
import Img from "../../common/Img"

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)


export default function Insights() {
  const { token } = useSelector((state) => state.auth)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const data = await getInstructorInsights(token)
      setInsights(data)
      setLoading(false)
    })()
  }, [token])


  if (loading) {
    return (
      <div className="text-richblack-5">
        <p className="text-4xl font-boogaloo">Insights</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton" />
          ))}
        </div>
        <div className="mt-6 h-80 rounded-xl skeleton" />
      </div>
    )
  }

  if (!insights || insights.summary.totalCourses === 0) {
    return (
      <div className="text-richblack-5">
        <h1 className="text-4xl font-boogaloo">Insights</h1>
        <div className="mt-10 rounded-md bg-richblack-800 p-10 text-center">
          <p className="text-xl font-medium text-richblack-50">
            No data to show yet. Create courses to see your insights here.
          </p>
        </div>
      </div>
    )
  }

  const { summary, courses, topCoursesByRevenue, topCoursesByEnrollments, categoryDistribution } = insights

  const stats = [
    {
      label: "Total Courses",
      value: summary.totalCourses,
      icon: <VscBook />,
      sub: `${summary.publishedCount} Published · ${summary.draftCount} Draft`,
    },
    {
      label: "Total Students",
      value: summary.totalStudents,
      icon: <VscMortarBoard />,
      sub: "Across all your courses",
    },
    {
      label: "Total Revenue",
      value: `Rs. ${summary.totalRevenue.toLocaleString("en-IN")}`,
      icon: <FaRupeeSign />,
      sub: "Gross earnings",
    },
    {
      label: "Average Rating",
      value: summary.overallAvgRating || "—",
      icon: <VscStarFull />,
      sub: `${summary.totalReviews} reviews`,
    },
  ]

  const enrollmentBarData = {
    labels: topCoursesByEnrollments.map((c) =>
      c.courseName?.length > 20 ? c.courseName.slice(0, 20) + "…" : c.courseName
    ),
    datasets: [
      {
        label: "Students Enrolled",
        data: topCoursesByEnrollments.map((c) => c.enrolledCount),
        backgroundColor: "#FFD60A",
      },
    ],
  }

  const revenueBarData = {
    labels: topCoursesByRevenue.map((c) =>
      c.courseName?.length > 20 ? c.courseName.slice(0, 20) + "…" : c.courseName
    ),
    datasets: [
      {
        label: "Revenue (Rs.)",
        data: topCoursesByRevenue.map((c) => c.revenue),
        backgroundColor: "#06D6A0",
      },
    ],
  }

  const categoryLabels = Object.keys(categoryDistribution)
  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Enrollments by Category",
        data: categoryLabels.map((k) => categoryDistribution[k]),
        backgroundColor: [
          "#FFD60A",
          "#06D6A0",
          "#118AB2",
          "#EF476F",
          "#9381FF",
          "#F78C6B",
          "#A5DD9B",
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#F1F2FF" } },
    },
    scales: {
      x: { ticks: { color: "#AFB2BF" }, grid: { color: "#2C333F" } },
      y: { ticks: { color: "#AFB2BF" }, grid: { color: "#2C333F" } },
    },
  }


  return (
    <div className="text-richblack-5">
      <h1 className="text-4xl font-boogaloo text-center sm:text-left">Insights</h1>
      <p className="text-richblack-300 mt-1">
        Detailed performance metrics across all your courses
      </p>

      {/* Summary stat cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-richblack-800 border border-richblack-700 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-richblack-200 text-sm">{s.label}</p>
              <span className="text-yellow-50 text-xl">{s.icon}</span>
            </div>
            <p className="text-3xl font-semibold mt-2">{s.value}</p>
            <p className="text-xs text-richblack-300 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl bg-richblack-800 border border-richblack-700 p-5">
          <p className="text-lg font-bold mb-3">Top Courses by Enrollments</p>
          <div className="h-72">
            <Bar data={enrollmentBarData} options={chartOptions} />
          </div>
        </div>
        <div className="rounded-xl bg-richblack-800 border border-richblack-700 p-5">
          <p className="text-lg font-bold mb-3">Top Courses by Revenue</p>
          <div className="h-72">
            <Bar data={revenueBarData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Category Pie + Course Table */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-xl bg-richblack-800 border border-richblack-700 p-5 xl:col-span-1">
          <p className="text-lg font-bold mb-3">Enrollments by Category</p>
          {categoryLabels.length === 0 ? (
            <p className="text-richblack-300">No data</p>
          ) : (
            <div className="h-72">
              <Pie data={pieData} options={{ ...chartOptions, scales: {} }} />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-richblack-800 border border-richblack-700 p-5 xl:col-span-2 overflow-x-auto">
          <p className="text-lg font-bold mb-3">Per-Course Metrics</p>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-richblack-200 border-b border-richblack-700">
                <th className="py-2 px-2">Course</th>
                <th className="py-2 px-2 flex items-center gap-1"><VscEye /> Views</th>
                <th className="py-2 px-2">Clicks</th>
                <th className="py-2 px-2">Students</th>
                <th className="py-2 px-2 flex items-center gap-1"><VscFeedback /> Reviews</th>
                <th className="py-2 px-2">Rating</th>
                <th className="py-2 px-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="border-b border-richblack-700/50">
                  <td className="py-2 px-2 flex items-center gap-2">
                    <Img
                      src={c.thumbnail}
                      alt={c.courseName}
                      className="h-8 w-12 rounded object-cover"
                    />
                    <span className="line-clamp-1 max-w-[180px]">{c.courseName}</span>
                  </td>
                  <td className="py-2 px-2">{c.views}</td>
                  <td className="py-2 px-2">{c.clicks}</td>
                  <td className="py-2 px-2">{c.enrolledCount}</td>
                  <td className="py-2 px-2">{c.reviewsCount}</td>
                  <td className="py-2 px-2">{c.avgRating || "—"}</td>
                  <td className="py-2 px-2">Rs. {c.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-richblack-400 mt-4 italic">
        * Views and clicks are derived metrics based on enrollments and reviews;
        wire up a real telemetry pipeline (e.g. analytics events) to track them precisely.
      </p>
    </div>
  )
}
