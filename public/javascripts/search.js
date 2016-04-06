

var app = angular.module('myApp', []);

app.controller('ResultsController', ['$scope', '$http',
function($scope, $http) {


  $scope.submitSearch = function(searchQuery) {

    var searchCall = '/database/searchRecipeByTitle?title=' + searchQuery;

    console.log('sent: ' + searchCall);

      $http.get(searchCall).
        success(function(data, status, headers, config) {
        console.log('data: ' + data[0].title);
          $scope.recipes = data;
        }).
        error(function(data, status, headers, config) {
        console.log('failed');
          $scope.recipes = [];
        });

  };

  $scope.range = function(recipeRating) {

    var rating = [];
    console.log(recipeRating);
    for (var i = 0; i < recipeRating; i++) {
      rating.push(i);
    }
    console.log(rating);
    return rating;
  };

    $http.get('/database/recipeOrderByRating?number=3').success(function (data, status, headers, config) {
      console.log('data: ' + data[0].title);
      $scope.trending = data;
    }).error(function (data, status, headers, config) {
      console.log('failed');
      $scope.trending = [];
    });

  $scope.radioFunctionality = function(recipe, rating) {
    $http.post('/database/newRating', {rater: $scope.username, recipeId: recipe, rating:rating}).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.user = data; /* data is the user object by schema */
    }).
    error(function(data, status, headers, config) {
      console.log(data);
    });
  };



}]);
