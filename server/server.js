//[][][][][][][][][][][][][][][][][][][]
//              NPM
//[][][][][][][][][][][][][][][][][][][]

var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var passport = require('passport');
var session = require('express-session');
var localStrategy = require('passport-local').Strategy;

//[][][][][][][][][][][][][][][][][][][]
//              Local
//[][][][][][][][][][][][][][][][][][][]

var index = require('./routes/index.js');
var register = require('./routes/register');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

var app = express();

//[][][][][][][][][][][][][][][][][][][]
//    Configure middleware and routes
//[][][][][][][][][][][][][][][][][][][]

app.use(express.static('server/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge: 200000, secure: false}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/register', register);
app.use('/', index);

//[][][][][][][][][][][][][][][][][][][]
//              Passport
//[][][][][][][][][][][][][][][][][][][]

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
      console.log('called deserializeUser');
      pg.connect(connectionString, function (err, client) {

        var user = {};
        console.log('called deserializeUser - pg');
          var query = client.query("SELECT * FROM users WHERE id = $1", [id]);

          query.on('row', function (row) {
            console.log('User row', row);
            user = row;
            done(null, user);
          });

          // After all data is returned, close connection and return results
          query.on('end', function () {
              client.end();
          });

          // Handle Errors
          if (err) {
              console.log(err);
          }
      });

});

passport.use('local', new localStrategy({
    passReqToCallback: true,
    usernameField: 'username'
}, function(req, username, password, done){

    pg.connect(connectionString, function(err, client){
       var user = {};

        var query = client.query('SELECT * FROM users WHERE username = $1', [username]);

        query.on('row', function(row){
           user =row;
            console.log('User object', user);
        });

        query.on('end', function(){
           if(user && user.password === password){
               console.log('success');
               done(null, user);
           } else {
               done(null, false);
           }
            client.end();
        });
    });
}));

//[][][][][][][][][][][][][][][][][][][]
//          Initiate server
//[][][][][][][][][][][][][][][][][][][]

var server = app.listen(process.env.PORT || 3000, function(){
    var port = server.address().port;
    console.log('listening on port ', port);
});
