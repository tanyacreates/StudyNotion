export default function GetAvgRating(ratingArr) {
  if (!ratingArr || ratingArr.length === 0) return 0

  // rating values may be stored as strings — coerce to Number so we add (not concatenate).
  const totalReviewCount = ratingArr.reduce((acc, curr) => {
    return acc + (Number(curr.rating) || 0)
  }, 0)

  const multiplier = Math.pow(10, 1)
  const avgReviewCount =
    Math.round((totalReviewCount / ratingArr.length) * multiplier) / multiplier

  return avgReviewCount
}