var app = angular.module('myApp', []);

app.controller('LoadProfileInformationController', ['$scope', '$http', function($scope, $http){

    $http.get('/userById?username='+ $scope.username).
        success(function(data, status, headers, config) {
            console.log(data);
            $scope.user = data; /* data is the user object by schema */
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });

    $scope.range = function(recipeRating) {

      var ratings = [];
      for (i = 0; i < recipeRating; i++) {
        rating.push(i + 1);
      }
      return i;
    };

}]);

/*Not done yet, so don't worry that it's not working*/
app.controller('userToFollowTag', ['$scope', '$http', function($scope, $http, userName){

    $http.get('/userById?username=' + userName).
        success(function(data, status, headers, config) {
                console.log(data);
                $scope.follower = data; /* data is the user object by schema */
            }).
            error(function(data, status, headers, config) {
                console.log(data);
            });

}]);
