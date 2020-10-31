const router = require('koa-router')()
const query = require("../module/query");
const judgeToken = require('../module/judgeToken')
const getDay = require('../module/util')
const md5 = require('md5');
let qiniu = require('qiniu');
var moment = require('moment');

let config = {
  "AK": "gB3IVQ96HMuVEOkMeQ5CSSRJjvoAlnbpNWWN6rbO",
  "SK": "bUfywslvDjH3Se-SmbDJhXwpsaYOEvdDbrRgNOLI",
  "Bucket": "business-management"
}

router.prefix('/console')
//获取用户token
router.get('/userToken', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    ctx.body={
      code:200,
      msg:"获取成功",
      data:ctx.headers.token
    }
  }
})
//获取产品分类列表
router.get('/classifyList', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let sql = `SELECT classify_id,classify_name FROM classify WHERE userId=${tokenInfo.userId}`;
    await query(sql).then((results) => {
      let list = []
      results.map(item => {
        let obj = {}
        obj.label = item.classify_name
        obj.value = item.classify_id
        list.push(obj)
      })
      list.unshift({
        value: 0,
        label: "未分类"
      })
      if (results.length >= 0) {
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            classifyList: list
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到该用户有分类产品"
        };
      }
    })
  }
})

//产品名搜索联想
router.get('/productSearch', async (ctx, next) => {
  let option = ctx.query
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let sql;
    if (option.searchName !== "") {
      sql = `SELECT product_name as value FROM product WHERE product_name REGEXP '${option.searchName}' AND user_id=${tokenInfo.userId};`;
    } else {
      sql = `SELECT product_name as value FROM product WHERE user_id=${tokenInfo.userId};`;
    }
    await query(sql).then((results) => {
      if (results.length >= 0) {
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            searchList: results
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到相关产品"
        };
      }
    })
  }
})
//全部产品
router.get('/productList', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `SELECT product.exchangeIntegral,product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory,(SELECT COUNT(*) from product where product.user_id=${tokenInfo.userId}) as total FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id=${tokenInfo.userId} ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    await query(sql).then((results) => {
      if (results.length > 0) {
        results.map(item => {
          if (!item.classify) {
            item.classify = "未分类"
          }
        })
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            productList: results,
            total: results[0].total
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到相关产品"
        };
      }
    })
  }
})
//根据产品名的搜索结果
router.get('/searchProductResult', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql;
    if (option.searchName === "") {
      sql = `SELECT product.exchangeIntegral,product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory,(SELECT COUNT(*) from product where product.user_id=${tokenInfo.userId}) as total FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id=${tokenInfo.userId} ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    } else {
      sql = `SELECT product.exchangeIntegral,product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory,(SELECT COUNT(*) from product where product.user_id = ${tokenInfo.userId} AND product.product_name REGEXP '${option.searchName}') as total FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id = ${tokenInfo.userId} AND product.product_name REGEXP '${option.searchName}' ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    }
    await query(sql).then((results) => {
      if (results.length > 0) {
        results.map(item => {
          if (!item.classify) {
            item.classify = "未分类"
          }
        })
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            productList: results,
            total: results[0].total
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到相关产品"
        };
      }
    })
  }
})
//根据分类查询的结果
router.get('/classifyResult', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql;
    if (option.classify === "0") {
      sql = `SELECT product.exchangeIntegral,product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id = ${tokenInfo.userId} AND product.classify_id=0 ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    } else {
      sql = `SELECT product.exchangeIntegral,product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id = ${tokenInfo.userId} AND classify.classify_id='${option.classify}' ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    }
    await query(sql).then((results) => {
      if (results.length > 0) {
        results.map(item => {
          if (!item.classify) {
            item.classify = "未分类"
          }
        })
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            productList: results,
            total: results.length
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到相关产品"
        };
      }
    })
  }
})
//删除产品
router.get('/deleteProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    //删除七牛云图片
    if (option.product_img !== "product_img") {
      let mac = new qiniu.auth.digest.Mac(config.AK, config.SK);
      var options = new qiniu.conf.Config();
      var bucketManager = new qiniu.rs.BucketManager(mac, options);
      var key = option.product_img; // 传递文件名
      bucketManager.delete(config.Bucket, key, function (err, respBody, respInfo) {});
    }
    let sql = `delete from product where product_id = ${option.product_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "删除成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "删除失败"
        };
      }
    })
  }
})
//修改产品库存状态信息
router.get('/revampInventory', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    if (option.inventory === "0") {
      option.inventory = 1
    } else {
      option.inventory = 0
    }
    let sql = `update product set inventory=${option.inventory} where product_id = ${option.product_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "修改成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "修改失败"
        };
      }
    })
  }
})
//获取用户的分类列表及该分类下的产品数量
router.get('/classifyParticulars', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql1 = `SELECT classify.classify_id,classify.classify_name,count(product.classify_id) AS classify_num from classify LEFT JOIN product ON classify.classify_id=product.classify_id WHERE classify.userId=${tokenInfo.userId} GROUP BY classify.classify_id LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize};`;
    let sql2 = `SELECT product.classify_id,classify_name,COUNT(*) AS classify_num from product LEFT JOIN classify ON classify.classify_id=product.classify_id WHERE product.classify_id=0 AND product.user_id=${tokenInfo.userId} GROUP BY product.classify_id;`
    let sql3 = `SELECT count(*) as total FROM classify classify WHERE userId=${tokenInfo.userId}`
    await query(sql1 + sql2 + sql3).then((results) => {
      let results1 = results[0];
      if (results[1].length !== 0 && option.currentPage === "1") {
        results1.unshift(results[1][0])
        results[2][0].total++
      }
      if (results1.length > 0) {
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            list: results1,
            total: results[2][0].total
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "查询失败"
        };
      }
    })
  }
})
//删除分类
router.get('/deleteClassify', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    await query(`UPDATE product SET classify_id =0 WHERE classify_id=${option.classify_id}`)
    let sql = `delete from classify where classify_id = ${option.classify_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "删除成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "删除失败"
        };
      }
    })
  }
})
//修改分类的名称
router.get('/revampClassify', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `update classify set classify_name='${option.newClassifyName}' where classify_id = ${option.classify_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "修改成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "修改失败"
        };
      }
    })
  }
})
//添加分类
router.get('/addClassify', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `INSERT INTO classify (classify_name,userId) VALUES ('${option.createClassifyName}',${tokenInfo.userId})`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "添加成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "添加失败"
        };
      }
    })
  }
})
//获取添加产品页面的分类列表
router.get('/addProductClassifyList', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let sql = `SELECT classify_id,classify_name FROM classify WHERE userId=${tokenInfo.userId}`;
    await query(sql).then((results) => {
      let list = []
      results.map(item => {
        let obj = {}
        obj.label = item.classify_name
        obj.value = item.classify_id
        list.push(obj)
      })
      if (results.length >= 0) {
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: list
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到该用户有分类产品"
        };
      }
    })
  }
})
//添加产品
router.get('/addProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `INSERT INTO product (user_id,product_name,product_detailed,purchasing_price,selling_price,inventory,classify_id,exchangeIntegral,product_img) VALUES (?,?,?,?,?,?,?,?,?)`;
    let values = [tokenInfo.userId, option.product_name, option.product_detailed, option.purchasing_price, option.selling_price, option.inventory, option.classify_id, option.exchangeIntegral, option.product_img]
    await query(sql, values).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "添加成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "添加失败"
        };
      }
    })
  }
})
//编辑产品
router.get('/revampProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `update product set product_name=?,product_detailed=?,purchasing_price=?,selling_price=?,classify_id=?,exchangeIntegral=? where product_id = ?`;
    let values = [option.product_name, option.product_detailed, option.purchasing_price, option.selling_price, option.classify_id, option.exchangeIntegral, option.product_id]
    await query(sql, values).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "修改成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "修改失败"
        };
      }
    })
  }
})
//修改产品图片
router.get('/revampProductImg', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    await query(`select product_img from product where product_id = ${option.product_id}`).then((results) => {
      if (results[0].product_img !== "product_img") {
        let mac = new qiniu.auth.digest.Mac(config.AK, config.SK);
        var options = new qiniu.conf.Config();
        var bucketManager = new qiniu.rs.BucketManager(mac, options);
        var key = results[0].product_img; // 传递文件名
        bucketManager.delete(config.Bucket, key, function (err, respBody, respInfo) {});
      }
    })
    let sql = `update product set product_img=? where product_id = ?`;
    let values = [option.product_img, option.product_id]
    await query(sql, values).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "修改成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "修改失败"
        };
      }
    })
  }
})
//添加订单
router.get('/addOrderForm', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    if (option.member_phone === "") { //没有会员直接添加
      await query(`INSERT INTO order_form (user_id,product_id,kind) VALUES (${tokenInfo.userId},${option.product_id},"${option.kind}")`).then((results) => {
        if (results.affectedRows > 0) {
          ctx.body = {
            code: 200,
            msg: "订单添加成功",
            data: {}
          };
        }
      })
    } else { //有会员的
      let results = await query(`SELECT * FROM member WHERE phone_number = '${option.member_phone}'`)
      if (results.length === 0) {
        ctx.body = {
          code: 201,
          msg: "该会员手机号不存在!"
        };
      } else {
        let res = await query(`INSERT INTO order_form (user_id,product_id,kind,member_phone,exchangeIntegral) VALUES (${tokenInfo.userId},${option.product_id},"${option.kind}","${option.member_phone}","${option.exchangeIntegral}")`)
        let res2 = await query(`UPDATE member SET integral = ${Number(results[0].integral)+Number(option.exchangeIntegral)} WHERE phone_number = ${option.member_phone}`)
        if (res.affectedRows > 0 && res2.affectedRows > 0) {
          ctx.body = {
            code: 200,
            msg: "订单添加成功",
            data: {
              integral: Number(results[0].integral) + Number(option.exchangeIntegral)
            }
          };
        }
      }
    }
  }
})
//全部订单
router.get('/orderFormList', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `SELECT *,(SELECT COUNT(*) FROM order_form  WHERE user_id =${tokenInfo.userId}) as total FROM order_form  LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} ORDER BY order_form.orderForm_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    await query(sql).then((results) => {
      results.map(item => {
        item.create_time = moment(item.create_time).format("YYYY-MM-DD HH:mm:ss")
      })
      if (results.length > 0) {
        ctx.body = {
          code: 200,
          msg: "全部订单查询成功",
          data: {
            orderFormList: results,
            total: results[0].total
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "全部订单查询失败"
        };
      }
    })
  }
})
//删除订单
router.get('/deleteOrderForm', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    if (option.member_phone === "") {
      await query(`delete from order_form where orderForm_id = ${option.orderForm_id}`).then(results => {
        if (results.affectedRows > 0) {
          ctx.body = {
            code: 200,
            msg: "删除成功"
          };
        } else {
          ctx.body = {
            code: 201,
            msg: "删除失败"
          };
        }
      })
    } else {
      await query(`delete from order_form where orderForm_id = ${option.orderForm_id};
      UPDATE member SET integral=integral-${option.exchangeIntegral} WHERE phone_number='${option.member_phone}'`).then(results => {
        if (results[0].affectedRows > 0, results[1].affectedRows > 0) {
          ctx.body = {
            code: 200,
            msg: "删除成功"
          };
        } else {
          ctx.body = {
            code: 201,
            msg: "删除失败"
          };
        }
      })
    }
  }
})
//查询会员
router.get('/memberList', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let results = await query(`SELECT *,(SELECT COUNT(*) FROM member WHERE user_id=${tokenInfo.userId}) as total FROM member WHERE user_id=${tokenInfo.userId} ORDER BY member_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`)
    for (let i = 0; i < results.length; i++) {
      results[i].create_time = moment(results[i].create_time).format("YYYY-MM-DD HH:mm:ss")
      let res = await query(`SELECT COUNT(*) as count FROM order_form WHERE member_phone="${results[i].phone_number}" AND user_id=${tokenInfo.userId}`)
      results[i].count = res[0].count
    }
    ctx.body = {
      code: 200,
      msg: "查找成功",
      data: {
        memberList: results,
        total: results[0].total
      }
    }
  }
})
//删除会员
router.get('/deleteMember', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `delete from member where member_id = ${option.member_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "删除成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "删除失败"
        };
      }
    })
  }
})
//根据手机号查询会员
router.get('/searchMember', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let results = await query(`SELECT * FROM member WHERE phone_number="${option.phone_number}" AND user_id=${tokenInfo.userId}`)
    if (results.length !== 0) {
      results[0].create_time = moment(results[0].create_time).format("YYYY-MM-DD HH:mm:ss")
      let res = await query(`SELECT COUNT(*) as count FROM order_form WHERE member_phone="${results[0].phone_number}" AND user_id=${tokenInfo.userId}`)
      results[0].count = res[0].count
    }
    if (results.length === 0) {
      ctx.body = {
        code: 201,
        msg: "未查到该会员信息!"
      }
    } else {
      ctx.body = {
        code: 200,
        msg: "查找成功",
        data: {
          member: results,
          total: results.length
        }
      }
    }
  }
})
//添加会员
router.get('/addMember', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `INSERT INTO member (user_id,member_name,phone_number) VALUES (?,?,?)`;
    let values = [tokenInfo.userId, option.member_name, option.phone_number]
    await query(sql, values).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "添加成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "添加失败"
        };
      }
    })
  }
})
//添加兑换产品
router.get('/addIntegralProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `INSERT INTO convertibility (product_name,conversion_integral,user_id) VALUES ('${option.product_name}',${option.conversion_integral},${tokenInfo.userId})`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "添加成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "添加失败"
        };
      }
    })
  }
})
//获取兑换产品列表
router.get('/integralProductList', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `SELECT *,(SELECT count(*) FROM convertibility WHERE user_id=${tokenInfo.userId}) as total FROM convertibility WHERE user_id=${tokenInfo.userId} ORDER BY convertibility_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    await query(sql).then((results) => {
      if (results.length > 0) {
        ctx.body = {
          code: 200,
          msg: "获取成功",
          data: {
            integralProductList: results,
            total: results[0].total
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "获取失败"
        };
      }
    })
  }
})
//修改兑换产品
router.get('/revampIntegralProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `update convertibility set product_name='${option.product_name}',conversion_integral=${option.conversion_integral} where convertibility_id = ${option.convertibility_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "修改成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "修改失败"
        };
      }
    })
  }
})
//删除兑换产品
router.get('/deleteIntegralProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `delete from convertibility where convertibility_id = ${option.convertibility_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "删除成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "删除失败"
        };
      }
    })
  }
})
//搜索兑换产品
router.get('/searchIntegralProduct', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let results = await query(`SELECT * FROM convertibility WHERE product_name="${option.product_name}" AND user_id=${tokenInfo.userId}`)
    if (results.length === 0) {
      ctx.body = {
        code: 201,
        msg: "未查到该会员信息!"
      }
    } else {
      ctx.body = {
        code: 200,
        msg: "查找成功",
        data: {
          integralProductList: results,
          total: results.length
        }
      }
    }
  }
})
//兑换产品
router.get('/conversion', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    //查询该会员手机号是否存在
    let results = await query(`SELECT * FROM member WHERE phone_number="${option.phone_number}" AND user_id=${tokenInfo.userId}`)
    if (results.length > 0) {
      let integral = results[0].integral //得到兑换前的积分
      if (integral - Number(option.integral) < 0) { //如果兑换后的积分小于0那么设置为0
        ctx.body = {
          code: 202,
          msg: "该会员积分不够!当前积分:" + integral
        }
        return
      } else {
        integral = integral - Number(option.integral)
        let res = await query(`update member set integral=${integral} where phone_number = "${option.phone_number}"`)
        if (res.affectedRows > 0) {
          await query(`INSERT INTO for_record (user_id,convertibility_id,phone_number) VALUES (${tokenInfo.userId},${option.convertibility_id},${option.phone_number})`)
          ctx.body = {
            code: 200,
            msg: "兑换成功!积分剩余:" + integral
          };
        } else {
          ctx.body = {
            code: 203,
            msg: "服务器异常,请稍后再试!"
          };
          return
        }
      }
    } else {
      ctx.body = {
        code: 201,
        msg: "没有该会员!"
      }
    }
  }
})
//全部兑换记录
router.get('/forRecord', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `SELECT *,(SELECT COUNT(*) FROM for_record WHERE user_id=${tokenInfo.userId}) as total FROM for_record LEFT JOIN convertibility ON for_record.convertibility_id=convertibility.convertibility_id WHERE for_record.user_id=${tokenInfo.userId} ORDER BY for_record.record_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    await query(sql).then((results) => {
      if (results.length > 0) {
        results.map(item => {
          item.record_time = moment(item.record_time).format("YYYY-MM-DD HH:mm:ss")
        })
        ctx.body = {
          code: 200,
          msg: "查询成功",
          data: {
            forRecordList: results,
            total: results[0].total
          }
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "未查询到相关产品"
        };
      }
    })
  }
})
//搜索兑换记录
router.get('/searchForRecord', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let results = await query(`SELECT *,(SELECT COUNT(*) FROM for_record WHERE user_id=${tokenInfo.userId} and phone_number="${option.phone}") as total FROM for_record LEFT JOIN convertibility ON for_record.convertibility_id=convertibility.convertibility_id WHERE for_record.user_id=${tokenInfo.userId} and for_record.phone_number="${option.phone}" ORDER BY for_record.record_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`)
    if (results.length === 0) {
      ctx.body = {
        code: 201,
        msg: "该会员没有兑换记录!"
      }
    } else {
      results.map(item => {
        item.record_time = moment(item.record_time).format("YYYY-MM-DD HH:mm:ss")
      })
      ctx.body = {
        code: 200,
        msg: "查找成功",
        data: {
          forRecordList: results,
          total: results[0].total
        }
      }
    }
  }
})
//删除兑换记录
router.get('/deleteForRecord', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let sql = `delete from for_record where record_id = ${option.record_id}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "删除成功"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "删除失败"
        };
      }
    })
  }
})
//获取单日报表
router.get('/dayStatistics', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let results = await query(`SELECT order_form.product_id,product.product_name FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month} and day(order_form.create_time ) = ${option.day} GROUP BY order_form.product_id`)
    if (results.length > 0) {
      let xAxis = { //有哪些产品
        type: "category",
        data: []
      }
      let series = [{
        data: [],
        type: "bar"
      }]
      for (let i = 0; i < results.length; i++) {
        let count = await query(`SELECT COUNT(*) as count FROM order_form WHERE user_id=${tokenInfo.userId} AND product_id=${results[i].product_id} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month} and day(order_form.create_time ) = ${option.day}`)
        results[i].count = count[0].count
        xAxis.data.push(results[i].product_name)
        series[0].data.push(results[i].count)
      }
      let profit = await query(`SELECT SUM(product.selling_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month} and day(order_form.create_time ) = ${option.day};
      SELECT SUM(product.purchasing_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month} and day(order_form.create_time ) = ${option.day}`)
      if (!profit[0][0].sum) {
        profit[0][0].sum = 0
      }
      if (!profit[1][0].sum) {
        profit[1][0].sum = 0
      }
      ctx.body = {
        code: 200,
        msg: "获取成功",
        data: {
          xAxis,
          series,
          salesAmount: (profit[0][0].sum).toFixed(2),
          netIncome: (profit[0][0].sum - profit[1][0].sum).toFixed(2)
        }
      };
    } else {
      ctx.body = {
        code: 201,
        msg: "获取失败"
      };
    }
  }
})
//获取月份报表
router.get('/monthStatistics', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let days = getDay(option.year, option.month.toString())
    let results = []
    for (let i = 0; i < days; i++) {
      let res = await query(`SELECT SUM(product.selling_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month} and day(order_form.create_time ) = ${i+1}`)
      if (!res[0].sum) {
        res[0].sum = 0
      }
      results.push(res[0].sum)
    }
    let series = [{
      type: "line",
      showSymbol: false,
      data: results
    }]
    let profit = await query(`SELECT SUM(product.selling_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month};
    SELECT SUM(product.purchasing_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${option.month}`)
    if (!profit[0][0].sum) {
      profit[0][0].sum = 0
    }
    if (!profit[1][0].sum) {
      profit[1][0].sum = 0
    }
    ctx.body = {
      code: 200,
      msg: "获取成功",
      data: {
        series,
        salesAmount: (profit[0][0].sum).toFixed(2),
        netIncome: (profit[0][0].sum - profit[1][0].sum).toFixed(2)
      }
    };
  }
})
//获取月份报表
router.get('/yearStatistics', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.query
    let eatInList = [] //堂食的数据
    let takeOutList = [] //外卖的数据
    let netIncomeList = [] //纯收入的数据
    let salesAmount = 0 //总销售额
    let purchasingPrice = 0 //总进价
    for (let i = 1; i < 13; i++) {
      let res = await query(`SELECT COUNT(*) as count FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${i} AND order_form.kind="堂食/打包";
      SELECT COUNT(*) as count FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${i};
      SELECT SUM(product.selling_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${i};
      SELECT SUM(product.purchasing_price) as sum FROM order_form LEFT JOIN product ON order_form.product_id=product.product_id WHERE order_form.user_id=${tokenInfo.userId} AND year(order_form.create_time ) = ${option.year} and month(order_form.create_time )= ${i}`)
      eatInList.push(res[0][0].count)
      takeOutList.push(res[1][0].count - res[0][0].count)
      salesAmount = salesAmount + res[2][0].sum
      purchasingPrice = purchasingPrice + res[3][0].sum
      netIncomeList.push((res[2][0].sum - res[3][0].sum).toFixed(2))
    }

    ctx.body = {
      code: 200,
      msg: "获取成功",
      data: {
        eatInList,
        takeOutList,
        netIncomeList,
        salesAmount,
        netIncome: (salesAmount - purchasingPrice).toFixed(2)
      }
    };
  }
})
//原密码验证
router.post('/pawVerify', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.request.body; //接收参数
    let sql = `SELECT * FROM user WHERE id=${tokenInfo.userId} and password="${md5(option.password)}"`;
    await query(sql).then((results) => {
      if (results.length > 0) {
        ctx.body = {
          code: 200,
          msg: "密码正确!"
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "密码有误!",
        };
      }
    })
  }
})
//修改密码
router.post('/alterPassword', async (ctx, next) => {
  let tokenInfo = await judgeToken(ctx.headers.token)
  if (tokenInfo.code === -1) {
    ctx.body = {
      code: -1,
      msg: "token不合法,请重新登录"
    }
    return
  } else {
    let option = ctx.request.body; //接收参数
    let sql = `UPDATE user SET password="${md5(option.password)}" WHERE id=${tokenInfo.userId}`;
    await query(sql).then((results) => {
      if (results.affectedRows > 0) {
        ctx.body = {
          code: 200,
          msg: "密码修改成功!",
        };
      } else {
        ctx.body = {
          code: 201,
          msg: "密码修改失败!",
        };
      }
    })
  }
})



//获取七牛云token
router.post('/token', async (ctx, next) => {
  let mac = new qiniu.auth.digest.Mac(config.AK, config.SK);
  let options = {
    scope: config.Bucket,
    expires: 3600 * 24
  };
  let putPolicy = new qiniu.rs.PutPolicy(options);
  let uploadToken = putPolicy.uploadToken(mac);
  if (uploadToken) {
    ctx.body = {
      code: 200,
      msg: "获取成功",
      data: {
        uploadToken
      }
    }
  } else {
    ctx.body = {
      code: 201,
      msg: "获取失败"
    }
  }
})
//删除七牛云图片
router.post('/deleteQiqiu', async (ctx, next) => {
  let mac = new qiniu.auth.digest.Mac(config.AK, config.SK);
  var options = new qiniu.conf.Config();
  var bucketManager = new qiniu.rs.BucketManager(mac, options);
  var key = ctx.request.body.fileName; // 传递文件名
  bucketManager.delete(config.Bucket, key, function (err, respBody, respInfo) {
    console.log(err, respBody, respInfo)
  });
  ctx.body = {
    code: 200,
    msg: "删除成功!"
  }
})
module.exports = router