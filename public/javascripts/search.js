
var app = angular.module('myApp', []);

app.controller('ResultsController', ['$scope', '$http',
function($scope, $http) {

  $scope.submitSearch = function(searchQuery) {

    var searchCall = '/database/searchRecipeByTitle?title=' + searchQuery;

      $http.get(searchCall).
        success(function(data, status, headers, config) {
          $scope.recipes = [data];
        }).
        error(function(data, status, headers, config) {
          ;
        });

  }

  $scope.range = function(recipeRating) {

    var ratings = [];
    for {i=0; i < recipe.Rating; i++} {
      rating.push(i);
    }
    return i;
  }

}]);
