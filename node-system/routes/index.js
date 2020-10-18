const router = require('koa-router')()
const query = require("../module/query");
const md5 = require('md5');
const jwt = require('jsonwebtoken')
const TOKEN_KEY = "dhgioh1dIO114AAH7Si9osh8oK5AJ5546D211464A"
const judgeToken = require('../module/judgeToken')
let qiniu = require('qiniu');

let config = {
  "AK": "gB3IVQ96HMuVEOkMeQ5CSSRJjvoAlnbpNWWN6rbO",
  "SK": "bUfywslvDjH3Se-SmbDJhXwpsaYOEvdDbrRgNOLI",
  "Bucket": "business-management"
}

router.prefix('/console')

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
    let sql = `SELECT product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory,(SELECT COUNT(*) from product where product.user_id=${tokenInfo.userId}) as total FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id=${tokenInfo.userId} ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
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
    let sql = `SELECT product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory,(SELECT COUNT(*) from product where product.user_id = ${tokenInfo.userId} AND product.product_name REGEXP '${option.searchName}') as total FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id = ${tokenInfo.userId} AND product.product_name REGEXP '${option.searchName}' ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
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
      sql = `SELECT product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id = ${tokenInfo.userId} AND product.classify_id=0 ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
    } else {
      sql = `SELECT product.classify_id,product.product_img,product.product_id,product.product_name,product.product_detailed,product.purchasing_price,product.selling_price,classify.classify_name AS classify,product.inventory FROM product LEFT JOIN classify ON product.classify_id =classify.classify_id WHERE product.user_id = ${tokenInfo.userId} AND classify.classify_id='${option.classify}' ORDER BY product_id DESC LIMIT ${(Number(option.currentPage)-1)*Number(option.pageSize)},${option.pageSize}`;
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
    let sql = `INSERT INTO product (user_id,product_name,product_detailed,purchasing_price,selling_price,inventory,classify_id,product_img) VALUES (?,?,?,?,?,?,?,?)`;
    let values = [tokenInfo.userId, option.product_name, option.product_detailed, option.purchasing_price, option.selling_price, option.inventory, option.classify_id, option.product_img]
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
    let sql = `update product set product_name=?,product_detailed=?,purchasing_price=?,selling_price=?,classify_id=? where product_id = ?`;
    let values = [option.product_name, option.product_detailed, option.purchasing_price, option.selling_price, option.classify_id, option.product_id]
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