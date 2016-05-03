var express = require('express');
var path = require('path');
var pg = require('pg');
var passport = require('passport');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

var router = express.Router();

router.get('/', function(request, response){
   response.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.get('/fail', function(request, response) {
   response.sendFile(path.join(__dirname, '../public/views/fail.html'));
});

router.get('/*', function(request, response, next) {
   if(request.isAuthenticated()) {
      next();
   } else {
      response.redirect('/');
   }
});

router.get('/home', function(request, response) {
   response.sendFile(path.join(__dirname, '../public/views/home.html'));
});

//add new list
router.post('/add', function(request, response) {

   if(request.isAuthenticated()) {

       pg.connect(connectionString, function(err, client){

         var query = client.query('INSERT INTO lists (title, description, user_id) VALUES ($1, $2, $3)', [request.body.title, request.body.description, request.user.id]);

         query.on('error', function(err){
           console.log('add error', err);
         });

         query.on('end', function(){
           response.sendStatus(200);
           client.end();
         });

       });
    } else {
        response.redirect('/');
    }
});

//get user's lists from db
router.get('/getLists', function (request, response) {

   var lists = '';

   if(request.isAuthenticated()) {

       pg.connect(connectionString, function(err, client){

         var query = client.query('SELECT * FROM lists WHERE user_id = $1', [request.user.id]);

         query.on('error', function(err){
           console.log('get lists error', err);
         });

         query.on('row', function(row, result){
            result.addRow(row);
            lists = result;
         });

         query.on('end', function(){
           if (lists == '') {
            response.sendStatus(200);
           } else {
            response.send(lists);
           }
           client.end();
         });

       });
     } else {
         response.redirect('/');
     };

});

//add item to list
router.post('/addItem', function(request, response) {

   if(request.isAuthenticated()) {

       pg.connect(connectionString, function(err, client){

         var query = client.query('INSERT INTO items (title, note, state, list, user_id) VALUES ($1, $2, $3, $4, $5)', [request.body.title, request.body.note, request.body.state, request.body.listId, request.user.id]);

         query.on('error', function(err){
           console.log('add item error', err);
         });

         query.on('end', function(){
           response.sendStatus(200);
           client.end();
         });

       });

   } else {
       response.redirect('/');
   };
});

//get user's items from db
router.get('/getItems', function(request, response) {

  var items = '';

  if(request.isAuthenticated()) {

     pg.connect(connectionString, function(err, client){

       var query = client.query('SELECT * FROM items WHERE user_id = $1', [request.user.id]);

       query.on('error', function(err){
         console.log('add item error', err);
       });

       query.on('row', function(row, result){
         result.addRow(row);
         items = result;
       });

       query.on('end', function(){
         if (items == ''){
           response.sendStatus(200);
         } else {
           response.send(items);
         }
         client.end();
       });

     });

   } else {
       response.redirect('/');
   };

});

//deletes list
router.put('/deleteList', function(request, response){

  if(request.isAuthenticated()) {

      pg.connect(connectionString, function(err, client){

        var query = client.query('DELETE FROM lists WHERE id = $1', [request.body.id]);

        query.on('error', function(err){
          console.log('delete list error', err);
        });

        query.on('end', function(){
          response.sendStatus(200);
          client.end();
        });

      });

  } else {
      response.redirect('/');
  };

});

//deletes item
router.put('/deleteItem', function(request, response){

  if(request.isAuthenticated()) {

      pg.connect(connectionString, function(err, client){

        var query = client.query('DELETE FROM items WHERE id = $1', [request.body.id]);

        query.on('error', function(err){
          console.log('delete item error', err);
        });

        query.on('end', function(){
          response.sendStatus(200);
          client.end();
        });

      });

} else {
    response.redirect('/');
};

});

router.get('/getUser', function (request, response) {
   response.send(request.user);
});

router.post('/', passport.authenticate('local', {
   successRedirect: '/home',
   failureRedirect: '/fail'
}));

module.exports = router;
