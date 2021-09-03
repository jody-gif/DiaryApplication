

function formatDate(inputDate) {
    var entryDate = new Date(inputDate);
    var year = entryDate.getFullYear();
    var month = entryDate.getMonth();
    var day = entryDate.getDate();
    var hour = entryDate.getHours();
    var minute = entryDate.getMinutes();
    var monthDigit = (month < 10) ? "0" : "";
    var dayDigit = (day < 10) ? "0" : "";
    var hourDigit = (hour < 10) ? "0" : "";
    var minuteDigit = (minute < 10) ? "0" : "";
    var dateString = "[" + year
        + "-" + monthDigit + month
        + "-" + dayDigit + day
        + "] " + hourDigit + hour
        + ":" + minuteDigit + minute;

    return dateString;
}




module.exports = {
    formatDate: formatDate
}