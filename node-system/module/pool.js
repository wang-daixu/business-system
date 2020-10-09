const mysql = require('mysql');

//创建与数据库的链接对象
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'business_system',
    connectionLimit: 15,
    multipleStatements: true  //允许query执行多条SQL语句
});
module.exports = pool;