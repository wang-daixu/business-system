const router = require('koa-router')()
const query = require("../module/query");
const md5 = require('md5');
const jwt = require('jsonwebtoken')
const TOKEN_KEY = "dhgioh1dIO114AAH7Si9osh8oK5AJ5546D211464A"
const sendEmail = require('../module/sendEmail')
const judgeToken = require('../module/judgeToken')
router.prefix('/user')


/**
 * 登录接口
 */
router.post('/login', async (ctx, next) => {
  let option = ctx.request.body; //接收参数
  let sql = `SELECT * FROM user WHERE name="${option.name}" and password="${md5(option.password)}"`;
  await query(sql).then((results) => {
    if (results.length > 0) {
      let token = jwt.sign({    //生成token
        userId:results[0].id,
        name: option.name,
        password: md5(option.password)
      }, TOKEN_KEY, {
        expiresIn: 60 * 60 * 24 * 30
      });
      ctx.body = {
        code: 200,
        msg: "登录成功",
        data: {
          userId:results[0].id,
          token: token
        }
      };
    } else {
      ctx.body = {
        code: 201,
        msg: "账号密码有误",
      };
    }
  })
})

/**
 * 获取修改密码的邮箱验证码
 */
router.post('/getPwdCaptcha', async (ctx, next) => {
  let option = ctx.request.body; //接收参数
  let sql = `SELECT * FROM user WHERE name="${option.name}" and email="${option.email}"`;
  let captcha = ""
  for (let i = 0; i < 6; i++) {
    captcha = captcha + Math.floor(Math.random() * 10)
  }
  await query(sql).then((results) => {
    if (results.length !== 0) {
      sendEmail(option.email, captcha)
      ctx.body = {
        code: 200,
        msg: "验证码获取成功!",
        data: {
          captcha: captcha
        }
      };
    } else {
      ctx.body = {
        code: 201,
        msg: "未查询到该手机号对应的邮箱",
      };
    }
  })
})

/**
 * 修改密码
 */
router.post('/changePassword', async (ctx, next) => {
  let option = ctx.request.body; //接收参数
  let sql = `UPDATE user SET password="${md5(option.password)}" WHERE name="${option.name}" and email="${option.email}"`;
  await query(sql).then((results) => {
    if (results.affectedRows > 0) {
      ctx.body = {
        code: 200,
        msg: "密码修改成功!",
      };
    } else {
      ctx.body = {
        code: 201,
        msg: "密码修改失败,找不到手机号或邮箱!",
      };
    }
  })
})

/**
 * 注册用户
 */
router.post('/register', async (ctx, next) => {
  let option = ctx.request.body; //接收参数
  let sql = `INSERT INTO user (name, password, email) VALUES ("${option.name}","${md5(option.password)}","${option.email}")`;
  await query(sql).then((results) => {
    if (results.affectedRows !== 0) {
      ctx.body = {
        code: 200,
        msg: "注册成功!",
      };
    } else {
      ctx.body = {
        code: 201,
        msg: "注册失败!",
      };
    }
  })
})

/**
 * 获取修改密码的邮箱验证码
 */
router.post('/getCaptcha', async (ctx, next) => {
  let option = ctx.request.body; //接收参数
  let captcha = ""
  for (let i = 0; i < 6; i++) {
    captcha = captcha + Math.floor(Math.random() * 10)
  }
  let result = await sendEmail(option.email, captcha);
  if (result === 1) {
    ctx.body = {
      code: 200,
      msg: "验证码发送成功!",
      data: {
        captcha: captcha
      }
    };
  } else {
    ctx.body = {
      msg: "验证码发送失败,请检查邮箱格式",
      code: 201
    }
  }
})
module.exports = router