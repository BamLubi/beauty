
/**
 * 格式化时间输出格式：YYYY-MM-DD HH-MM-SS
 * @param {Date} date 
 */
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 补齐数字为2位
 * @param {number} n
 * @return {string}
 */
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
 * 生成16位UUID
 * @param {number} type 0是订单码，1是会员码
 * @return {string}
 */
function makeUUID(type=0){
    let a,b,c;
    [a,b,c] = [a,b,c].map(()=>{
        return Math.floor(Math.random()*10);
    })
    let time = new Date().getTime();
    if (type == 0) {
        // 返回完全码
        return '' + a + time + b + c;
    }else{
        // 返回会员码
        time = time - 1627000000000;
        return '' + a + '0000' + time + b + c;
    }
}

module.exports = {
    formatTime: formatTime,
    makeUUID: makeUUID
}