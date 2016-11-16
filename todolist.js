var pool = require ('./config');

var getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        callback(connection);
    })
};

var todoList = {
    // Получение всех задач
    list: function (callback) {
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query('select * from todos;', callback);
            connection.release();
        });
    },

    // Добавить задачу
    add: function (text, completed, callback) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('insert into todos (text, completed) values (?,?)', [text,completed], callback);
            connection.release();
        });
    },

    //загрузить задачу для изменения
    changePage: function (id, callback) {
      pool.getConnection(function (err, connection) {
         if (err) throw err;
          connection.query('select * from todos where id=?', [id], callback);
          connection.release;
      });
    },

    // Изменить описание задачи
    change: function(id, text, completed, callback) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('update todos set text=?, completed=? where id=?', [text, completed, id], callback);
            connection.release;
        });
    },

    // Удаление задачи
    delete: function(id, callback) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('delete from todos where id=?', [id], callback);
            connection.release;
        })
    },
};

module.exports = todoList;
