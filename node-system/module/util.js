/**
 * 获取一个月有多少天
 */
module.exports= function getDay(year, month) {
    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if ((Number(year) % 4 === 0) && (Number(year) % 100 !== 0 || Number(year) % 400 === 0)) {
      days[1] = 29
    }
    return days[Number(month-1)]
  }