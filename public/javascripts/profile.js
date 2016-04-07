var app = angular.module('myApp', []);

app.controller('LoadProfileInformationController',
['$scope', '$http', function($scope, $http){
    angular.element(document).ready(function () {

        $scope.fileChosen = false;




    //Get the information of the user that is currently logged in
    $http.get('/database/userById?username='+ $scope.username).
        success(function(data, status, headers, config) {
            $scope.user = data;
        }).
        error(function(data, status, headers, config) {
          $scope.user = [];
        });



    //Get the recipes of the user that is currently logged in
    $http.get('/database/recipesByUsername?username=' + $scope.username)
    .success(function (data, status, headers, config) {
            $scope.recipes = data;
        }).error(function (data, status, headers, config) {
            $scope.recipes = [];
        });



        $scope.changeChosen = function() {
            $scope.fileChosen = true;
            console.log($scope.fileChosen);
        }



    //range function to show recipe rating, needed an array to iterate through
    $scope.range = function(recipeRating) {
          var rating = [];
          for (var i = 0; i < recipeRating; i++) {
            rating.push(i);
          }
          return rating;
        };



    /*
    * if user clicks on a rating radio button, add new rating to recipe
    * if user has already rated recipe, server will update current rating
    * rather than adding another rating
    */
    $scope.radioFunctionality = function(recipe, rating) {
      $http.post('/database/newRating',
      {rater: $scope.username, recipeId: recipe, rating:rating}).
          success(function(data, status, headers, config) {
              $scope.user = data;
          })
    };


    })
}]);
