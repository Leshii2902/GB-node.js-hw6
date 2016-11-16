var todoList = require('./todolist');
var app = require('express')();
var bodyParser = require('body-parser');
var pug = require('pug');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var YandexStrategy = require('passport-yandex').Strategy;


var port = 8000;

var YANDEX_CLIENT_ID = "a4650ed853074a58b73f3aaa42e1d4c5";
var YANDEX_CLIENT_SECRET = "1d363dbf79564da2ac703ffe6172d565";

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); // req.cookies
app.use(session({keys: ['howtoimplementremembermefeature?']})); // req.session
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// Настройка стратегии локальной авторизации
passport.use(new LocalStrategy(function (username, pass, done) {
    // Проверяем авторизационные данные
    if (username === 'admin' && pass === 'admin')
        return done(null, {username: username});
    done(null, false);
}));


//стратегия авторизации через яндекс
passport.use(new YandexStrategy({
        clientID: YANDEX_CLIENT_ID,
        clientSecret: YANDEX_CLIENT_SECRET,
        callbackURL: "http://localhost:8000/login_ya/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Метод сохранения данных пользователя в сессии
passport.serializeUser(function (user, done) {
    done(null, user);
});

// Метод извлечения данных пользователя из сессии
passport.deserializeUser(function (username, done) {
    done(null, {username});
});

// Главная страница для всех
app.get('/', function (req, res) {
    res
        .status(200)
        .render('main');

});

// Страница логина
app.get('/login', function (req, res) {
    res
        .status(200)
        .render('login');
});

// Обработчик запроса на локальную авторизацию
app.post('/login', bodyParser.urlencoded({ extended: false }), passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/login'
}));

// авторизация через яндекс
app.get('/login_ya',
    passport.authenticate('yandex'),
    function(req, res){
        // The request will be redirected to Yandex for authentication, so
        // this function will not be called.
    });

app.get('/login_ya/callback',
    passport.authenticate('yandex', { failureRedirect: '/main' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/user');
    });



// Кабинет пользователя (нужна авторизация)
app.get('/user', mustBeAuthentificated, function (req, res) {
    todoList.list(function (err,tasks) {
        if (err) throw err;
        res
            .status(200)
            .render('index', {
            tasks: tasks,
            title: 'Список задач'
        });
    })
});


//Создание новой задачи
app.get('/user/new', mustBeAuthentificated, function (req, res) {
    res
        .status(200)
        .render('new');
});

app.post('/user/post', mustBeAuthentificated, function (req, res) {
    todoList.add(req.body.text, req.body.completed, function (err) {
        if (err) throw  err;
        res
            .status(200)
            .redirect('/user');
    });
});

//Редактирование задачи
app.get('/user/edit/:id', mustBeAuthentificated, function(req, res) {
    todoList.changePage(req.params.id, function (err, task) {
        if (err) throw err;
        res
            .status(200)
            .render('edit', {text: task[0].text, completed: task[0].completed, id: task[0].id});
    });
});

app.post('/user', mustBeAuthentificated, function (req, res) {
    todoList.change(req.body.id, req.body.text, req.body.completed, function (err) {
        if (err) throw err;
        res
            .status(200)
            .redirect('/user');
    });
});


// Удаление задачи
app.get('/user/delete/:id', mustBeAuthentificated, function (req, res) {
    todoList.delete(req.params.id, function (err) {
        if (err) throw err;
        res
            .status(200)
            .redirect('/');
    });
});

// Страница выхода
app.get('/logout', function(req, res) {
    req.logout(); // выполняем выход через passportJS
    res.redirect('/'); // переход на главную
});


function mustBeAuthentificated (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login'); // переход на страницу логина
}

app.listen(port, function () {
   console.log('Сервер запущен на порту', + port);
});