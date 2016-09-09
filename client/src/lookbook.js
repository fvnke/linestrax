'use strict';
var Lookbook = angular.module('myApp');
Lookbook.controller('lookbookCtrl', function($scope, $anchorScroll, $http, $rootScope, $location, getService, $routeParams, $window, $document, anchorSmoothScroll, $route, $templateCache,preload){


$scope.mainImage;
$scope.mainLook = 1;
$scope.lookbookUnits = [];
$scope.lookbook_preload_array = [];
if(!$rootScope.isMobile){
	$scope.showMain = true;
}

$scope.$on("myEvent", function (event) {
	//only after data is pulled
	$scope.lookbookUnits = $rootScope.lookbook.units;
	$scope.mainImage = $rootScope.lookbook.units[0].src_large;

	if(!$rootScope.isMobile){
		for (var i in $rootScope.lookbook.units){
				$scope.lookbook_preload_array.push($rootScope.lookbook.units[i].src_large);
		}
		preload.images($scope.lookbook_preload_array);
	}


});


	$scope.thisImage = function(look, src){
		$scope.mainImage = src;
		$scope.mainLook = look;
	}


$scope.shiftImage = false;
$scope.animating = false;
$rootScope.readActive= false;
$scope.lookbookStatus ="read";


$scope.showDescription = function(){

	if(!$rootScope.isMobile){
		if($rootScope.readActive == false){
			$rootScope.readActive= true;
			$scope.lookbookStatus ="close";
		}else if($rootScope.readActive == true){
			$rootScope.readActive= false;
			$scope.lookbookStatus ="read";
		}
	}


		$rootScope.readScrollDisable();

		if($scope.animating == true){
			return false;
		}else if($scope.animating == false){

				$scope.shiftImage = !$scope.shiftImage;
				$scope.animating = true;
				setTimeout(function(){
					$scope.animating = false;
				}, 1000);
		}

		if($rootScope.isMobile){
			$scope.showMain = false;
		}
}


$scope.showMainImage= function(){
	$scope.showMain=true;
	$rootScope.disableScroll();
}

$scope.hideMainImage= function(){
	$scope.showMain=false;
	$rootScope.enableScroll();
}




$rootScope.readScrollDisable=function(){
	if($rootScope.readActive==true){
		$rootScope.disableScroll();

	}else if($rootScope.readActive==false){
				$rootScope.enableScroll();
	}
}


var newMain;

//navigating with keys
 jQuery(document.documentElement).keyup(function (event) {

				event.preventDefault();
			 // handle cursor keys
			 if ((event.keyCode == 39)&&($rootScope.isLookbook)) {

				//left right
				var index=$scope.mainLook-1;
				var arrayLength = ($scope.lookbookUnits.length-1);

				if(index < arrayLength){
					var newMain = $scope.mainLook;
				}else if (index >= arrayLength) {
					var newMain = 0;
				}

				 var thisUrl = $scope.lookbookUnits[newMain].src_large;
				 var thisLook = $scope.lookbookUnits[newMain].look;

				 $scope.thisImage(thisLook, thisUrl);

				 $scope.$apply();

			 } else if ((event.keyCode == 37)&&($rootScope.isLookbook)) {
//left arrow
				 var index=$scope.mainLook-1;

				 if(index>0){
					 var newMain = $scope.mainLook -2;
				 }else if (index<=0) {
					 var newMain = ($scope.lookbookUnits.length-1);
				 }

				 var thisUrl = $scope.lookbookUnits[newMain].src_large;
				 var thisLook = $scope.lookbookUnits[newMain].look;

				 $scope.thisImage(thisLook, thisUrl);

				 $scope.$apply();

			 }

	 });







 $scope.journalSwipeRight = function(){
		var mainLookVar = parseInt($scope.mainLook);
		 if($scope.mainLook == 1){
				$scope.mainLook = $scope.lookbookUnits.length-1;
				$scope.fastSwipeFN($scope.mainLook);
				mainImgVar=$scope.mainLook;
				$scope.mainImage = $scope.lookbookUnits[mainImgVar].src;
			}else if($scope.mainLook >= 1 ){
					$scope.leftScroll();
					$scope.mainLook = mainLookVar-1;
					mainImgVar=mainLookVar-1
					$scope.mainImage = $scope.lookbookUnits[mainImgVar].src;
			}
}


$scope.fastSwipeFN=function(int){
	setTimeout(function(){
		var scrollBy = (-1)*(jQuery("#lookbook-main-img-"+int).offset().left);
			jQuery(".lookbook-main").animate({
					scrollLeft: '-='+scrollBy
			}, 0, 'easeOutQuad');
			console.log(scrollBy);
		}, 50);
}

var windowWidth =$window.innerWidth;
$scope.leftScroll=function(){
	jQuery(".lookbook-main").animate({
			scrollLeft: '-='+windowWidth
	}, 600, 'easeOutQuad');
}

$scope.rightScroll=function(){
	jQuery(".lookbook-main").animate({
			scrollLeft: '+='+windowWidth
	}, 600, 'easeOutQuad');
}


$scope.journalSwipeLeft = function(){
	var mainLookVar = parseInt($scope.mainLook);
	var mainImgVar;
	if($scope.mainLook == ($scope.lookbookUnits.length-1)){
		$scope.fastSwipeFN(1);
		$scope.mainLook = 1;
		mainImgVar=1
		$scope.mainImage = $scope.lookbookUnits[mainImgVar].src;
	}else if($scope.mainLook <= ($scope.lookbookUnits.length-1)){
			$scope.rightScroll();
			$scope.mainLook = mainLookVar+1;
			mainImgVar=mainLookVar+1
			$scope.mainImage = $scope.lookbookUnits[mainImgVar].src;
			console.log($scope.mainLook);
	 }
}






});
Lookbook.directive('lookbookDirective', function($rootScope, $location){
	return{
		restrict:'E',
		templateUrl: 'views/lookbook.html',
    replace: true
	}
});