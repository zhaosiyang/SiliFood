var app = angular.module('myApp', []);

app.controller('LoadProfileInformationController', ['$scope', '$http', function($scope, $http){
    $scope.testUser = {};
    $scope.testUser.fullName = "Peter Brooks";
    $scope.testUser.bio = "I like turtles and puppies and cupcakes and tigers and cats and chocolate and pineapple and turtles and otters and yoyos and milkshakes and milklessshakes";
    
    $http.get('/userById?username='+ $scope.username).
        success(function(data, status, headers, config) {
            console.log(data);
            $scope.user = data; /* data is the user object by schema */
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });
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