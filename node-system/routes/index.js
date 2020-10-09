const router = require('koa-router')()

router.get('/index', async (ctx, next) => {
  ctx.body = {
    code: 200,
    msg: "查询成功",
    data: {name:"张三丰123"}
};
})


module.exports = router
