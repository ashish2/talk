// AngularJs Needed
// Works on top of AngularJs

//var app = angular.module("MyApp", []).config(function($interpolateProvider) {
	//$interpolateProvider.startSymbol('{$');
	//$interpolateProvider.endSymbol('$}');
//})

//app.module('MyApp').factory('users', function() {
	//var users = {};
	//users.list = [];
	//
	//users.add = function(u) {
		//users.list.push(u);
	//}
	//
	//return users;
//});

app.controller("UsersCtrl", function($scope, $http){
	$scope.selectedPerson = 0;
	$scope.selectedGenre = null;
	
	$scope.t = true;
	$scope.f = false;
	
	$scope.show_div = 0;
	$scope.users = [];
	
	// Filter by, on selecting `No` will remove the key of Languages from params, else, it will set key Languages with the id
	//$scope.params = {
		//format: "json",
		//offset: 0,
		//limit: 1,
		// Filters
		//languages: 0,
		//categories: 0,
		// Sorting
		//order_by: "length",
	//};
	
	$scope.show = function(user) {
		$scope.show_div = user.socket;
	};
	
	$scope.prepareFilter = function(e) {
		params = $scope.params;
		$scope.sanitizeParams();
		
		// Serialize params
		
		// Send params_str
		$scope.init();
	};
	
	//$scope.sanitizeParams = function() {
		//// FTM
		//if ($scope.params.languages == "")
			//delete $scope.params.languages;
		//if ($scope.params.categories == "")
			//delete $scope.params.categories;
	//};
	
	//$scope.init = function() {
		//$scope.sanitizeParams();
		//params = $.param($scope.params);
		//params = decodeURIComponent(params);
		////console.log("params", params);
		//url = '/api/v1/movies/?'+	params;
		//$http.get(url)
		//.success(function(data){
			//$scope.res = data;
			//$scope.movies = $scope.res.objects;
		//});
	//};
	
});


