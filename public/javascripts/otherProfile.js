var app = angular.module('myApp', []);

app.controller('LoadProfileInformationController',
['$scope', '$http', function($scope, $http){
    angular.element(document).ready(function () {

      //gives ability to add step to create a recipe form
      $scope.stepForms = [];
      $scope.addStep=function(){
        $scope.stepForms.push({});
      }

      //gives ability to add step to create a recipe form
      $scope.ingredientForms = [];
      $scope.addIngredient=function(){
        $scope.ingredientForms.push({});
      }


    //get the information of the user who's page is currently being viewed
    $http.get('/database/userById?username='+ $scope.username).
        success(function(data, status, headers, config) {
            $scope.user = data;
        }).
        error(function(data, status, headers, config) {
          $scope.user = [];
        });


    //Get the recipes of the user who's page is currently being viewed
    $http.get('/database/recipesByUsername?username=' + $scope.username)
    .success(function (data, status, headers, config) {
            $scope.recipes = data;
        }).error(function (data, status, headers, config) {
            $scope.recipes = [];
        });


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

  }]);
