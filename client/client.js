var app = angular.module("myApp", []);

app.controller("myController", ['$scope', '$http', function($scope, $http){

        $scope.placeholders = {
          title: 'title',
          note: 'note',
          state: 'state'
        };

        //get currently logged in user
        $http.get('/getUser').then(function(response) {
            $scope.user = response.data;
        });

        //get lists for currently logged in user
        $http.get('/getLists').then(function(response){
            $scope.lists = response.data.rows;
        });

        //get items for user's lists
        $http.get('/getItems').then(function(response){
          $scope.items = response.data.rows;
        });

        //if title exists, add list to db and refresh all lists
        $scope.addList = function(title,description){

          var newList = {
            title: title,
            description: description
          };

          if (newList.title == '' || newList.title == null || newList.title == undefined) {

            $scope.error = 'Please add a title';
            $scope.errorDisplay = true;

          } else {

            $http.post('/add', newList).then(function(response){

              $http.get('/getLists').then(function(response){
                $scope.lists = response.data.rows;

                //reset form
                $scope.title = '';
                $scope.description = '';

              });

            });
          }

        };

        //adds new item to db and refreshes all items
        $scope.addNewItem = function(list, newItem){

          newItem.listId = list.id;

          $http.post('/addItem', newItem).then(function(response){

            $http.get('/getItems').then(function(response){
              $scope.items = response.data.rows;
            });

          });
        };

        //deletes list
        $scope.deleteList = function(list){

          $http.put('/deleteList', list).then(function(response){

            $http.get('/getLists').then(function(response){
              $scope.lists = response.data.rows;
            });

          });
        };

        //deletes item
        $scope.deleteItem = function(item){

          $http.put('/deleteItem', item).then(function(response){

            $http.get('/getItems').then(function(response){
              $scope.items = response.data.rows;
            });

          });
        };

        $scope.removeErrorDisplay = function() {
          $scope.error = '';
          $scope.errorDisplay = false;
        }
}]);
