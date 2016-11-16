var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    database: 'gb_node',
    user: 'root',
    password: '',
});

module.exports = pool;