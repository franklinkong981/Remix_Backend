
const months = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December"
}

function convertToReadableDateTime(sqlTimestamp) {
  const dateObject = new Date(sqlTimestamp);

  const month = months[dateObject.getMonth()];
  const day = dateObject.getDate();
  const year = dateObject.getFullYear();
  
  const rawHours = dateObject.getHours();
  let hours;
  if (rawHours == 0) {
    hours = 12;
  } else if (rawHours <= 12) {
    hours = rawHours;
  } else {
    hours = rawHours - 12;
  }
  
  const rawMinutes = dateObject.getMinutes();
  const minutes = rawMinutes < 10 ? "0" + rawMinutes : rawMinutes
  const amOrPm = (rawHours < 12) ? "am" : "pm";

  return `${month}/${day}/${year} at ${hours}:${minutes}${amOrPm}`;
}

console.log(convertToReadableDateTime("2025-08-02 13:59:01.472785"));