var express = require('express');
var router = express.Router();
var pg = require('pg');
var passport = require('passport');
var path = require('path');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

router.get('/', function(req, res, next){
   res.sendFile(path.resolve(__dirname, '../public/views/register.html'));
});

router.post('/', function(req,res,next) {
  
  pg.connect(connectionString, function(err, client){

    var query = client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [req.body.username, req.body.password]);

    query.on('error', function(err){
      console.log(err);
    })

    query.on('end', function(){
      res.redirect('/');
      client.end();
    })

  })
});

module.exports = router;
