

const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secure: true,
    auth: {
        user: '2064889594@qq.com',
        pass: 'qlpyhyjvroqzcech' 
    }
});

module.exports = async function fn(email, code){
    let status = null
    await new Promise((resolve, reject) => {
        transporter.sendMail({
            from: '2064889594@qq.com',
            to: email, 
            subject: 'daixu后台管理系统',
            html: `
            <p>daixu后台管理系统验证码：</p>
        <span style="font-size: 18px; color: red">` + code + `</span>`+`<p>验证码将在<span style="color: red">60</span>秒后失效,请及时填写</p>`

        }, function (err, info) {
            if (err) {
                status = 0
                reject()
            } else {
                status = 1
                resolve()
            }
        });
    })
    return status


}

