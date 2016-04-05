var app = angular.module('myApp', []);

app.factory('recipeQuery', ["$location", "$http", "$scope",
function($location, $http, $scope) {

  $scope.recipeQuery = {};
  $scope.recipeQuery.recipes = [];
  $scope.recipeQuery.query = "";

  // If user searched for something, run search
  recipeQuery.switchSearchType = function(searchQuery) {
    $scope.recipeQuery.typeOfSearch = searchQuery;

    if (SearchService.query !== "") {
      $scope.recipeQuery.recipes = [];
      $scope.recipeQuery.submitSearch($scope.recipeQuery.query);
    }
  };

  // Search function
  $scope.recipeQuery.submitSearch = function(searchQuery) {
      alert("dfsd");

      // Alter URL to show new request, may be unnecessary with get call
      //$location.search('search', searchQuery);
    $scope.recipeQuery.query = searchQuery;


      $http.get('/database/allUsers').
        success(function(data, status, headers, config) {
          console.log(data);
          $scope.recipeQuery.recipes = data;
        }).
        error(function(data, status, headers, config) {
          $scope.recipeQuery.recipes = [];
        });
  };

  return $scope.recipeQuery;
}]);

app.controller('ResultsController', ['$scope', 'recipeQuery',
function($scope, recipeQuery) {

  // Create a reference to the recipeQuery so html can access it
  $scope.recipes = recipeQuery;
}]);

app.controller('QueryController', ['$scope', 'recipeQuery', '$http',
'$location', function($scope, recipeQuery, $http, $location) {

  // Your search input
  $scope.query = "";
}]);
