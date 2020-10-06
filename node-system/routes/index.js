const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  ctx.body = {
    code: 200,
    msg: "查询成功",
    data: {name:"张三丰"}
};
})


module.exports = router
