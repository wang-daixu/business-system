const jwt = require('jsonwebtoken')
const TOKEN_KEY = "dhgioh1dIO114AAH7Si9osh8oK5AJ5546D211464A"
module.exports = async function judgeToken(token) {
    let status = null;
    await new Promise((resolve, reject) => {
        jwt.verify(token, TOKEN_KEY, function (err, decode) {
            if (err) { //  时间失效的时候/ 伪造的token     
                status = {
                    msg: "token不合法,请重新登录",
                    code: -1
                }
                resolve()
            } else {
                status = decode
                resolve()
            }
        })
    })
    return status
}