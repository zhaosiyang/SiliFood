var app = angular.module('myApp', []);

app.controller('LoadProfileInformationController', ['$scope', '$http', function($scope, $http){
    angular.element(document).ready(function () {

    console.log('username: ' + $scope.username);

    $http.get('/database/userById?username='+ $scope.username).
        success(function(data, status, headers, config) {
            console.log("test");
            console.log(data.username);
            $scope.user = data; /* data is the user object by schema */
        }).
        error(function(data, status, headers, config) {
            console.log("failed");
            console.log(data);
        });

        $http.get('/database/recipesByUsername?username=' + $scope.username).success(function (data, status, headers, config) {
                console.log("test");
                console.log(data.username);
                $scope.recipes = data;
                /* data is the user object by schema */
            }).error(function (data, status, headers, config) {
                console.log("failed");
                console.log(data);
                $scope.recipes = [];
            });
        //};

    $scope.range = function(recipeRating) {

      var ratings = [];
      for (var i = 0; i < recipeRating; i++) {
        rating.push(i + 1);
      }
      return i;
    };
    });

}]);

/*Not done yet, so don't worry that it's not working*/
app.controller('userToFollowTag', ['$scope', '$http', function($scope, $http, userName){

    $http.get('/database/userById?username=' + userName).
        success(function(data, status, headers, config) {
                console.log(data);
                $scope.follower = data; /* data is the user object by schema */
            }).
            error(function(data, status, headers, config) {
                console.log(data);
            });

}]);
