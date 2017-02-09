'use strict'

var Shop = angular.module('myApp');
Shop.filter('shopFilter', function ($sce, $routeParams, $rootScope) {
  return function(data) {

    if($rootScope.Product){
                var filter = $rootScope.filter;
                $rootScope.filtered = [];


                if(!filter.collection.selected && !filter.gender.selected){
                  return data;
                }else{

                  // console.log('category: '+category);
                  for (var i in $rootScope.Product){

                    if(!$rootScope.Product[i].collection){

                    }else if($rootScope.Product[i].collection.value){

                      if($rootScope.filter.collection.selected && $rootScope.filter.gender.selected){

                        for (var c in $rootScope.Product[i].category.data){
                          if(($rootScope.Product[i].category.data[c].slug == $rootScope.filter.gender.selected) && ($rootScope.Product[i].collection.data.slug == filter.collection.selected)){
                            $rootScope.filtered = $rootScope.filtered.concat($rootScope.Product[i]);
                          }
                        }

                      }else if($rootScope.filter.collection.selected){

                        if($rootScope.Product[i].collection.data.slug == filter.collection.selected){
                          $rootScope.filtered = $rootScope.filtered.concat($rootScope.Product[i]);
                        }

                      }else if($rootScope.filter.gender.selected){
                        for (var c in $rootScope.Product[i].category.data){
                          if($rootScope.Product[i].category.data[c].slug == $rootScope.filter.gender.selected){
                            $rootScope.filtered = $rootScope.filtered.concat($rootScope.Product[i]);
                          }
                        }
                      }
                    }
                  }
                  return $rootScope.filtered;
                }

    }

  };
});

Shop.controller('shopCtrl', [ '$scope','$location', '$rootScope', '$http','transformRequestAsFormPost','$document','anchorSmoothScroll','$routeParams', function($scope, $location, $rootScope, $http, transformRequestAsFormPost, $document, anchorSmoothScroll, $routeParams){

  // $scope.filtered = [];
  $rootScope.page = "product";
  $rootScope.shopSections= [];
  $rootScope.Section= {};
  $rootScope.isGradient = true;
  $rootScope.filter={
    gender:{
      selected:''
    },
    collection:{
      selected:''
    }
  };








//......FILTER

// if($routeParams.shopcollection){
//   $rootScope.filter ={type:'collection', selected: $routeParams.shopcollection};
// }else{
//   $rootScope.filter ={type:"", selected: ""};
// }



$rootScope.selectFilter=(thistype, id)=>{
  // $rootScope.pageLoading = false;

  if(!id){
    $rootScope.filter['collection'].selected = id;
    $rootScope.filter['gender'].selected = id;

  }else{
    $location.search(thistype, id);
    $rootScope.filter[thistype].selected = id;
  }


}







//..add product


$rootScope.addToCart = function(id){

      $http({
        url: '/addProduct',
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json'
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: transformRequestAsFormPost,
        data: {
                id: id,
                access_token:"helloooo"
              }
      }).then(function(response){
        $rootScope.Cart = response;
        console.log(response);
        $rootScope.updateCart();
      });
}//addToCart


//......VARIATIONS

  $rootScope.addVariation = function(){

    console.log($scope.maxVariation($rootScope.selectedVariation));

    if($scope.maxVariation($rootScope.selectedVariation) == true){
      if($rootScope.selectedVariation){
        $http({
          url: '/addVariation',
          method: 'POST',
          data: $rootScope.selectedVariation
        }).then(function(response){
          $rootScope.Cart = response;
          console.log(response);
          $rootScope.updateCart();
        });
      }else{
        $scope.variationErrorMessage = "select a size first";
        setTimeout(function(){
          $scope.variationErrorMessage = false;
          $rootScope.$apply();
        });
      }
    }




  }//addToCart



  $scope.maxVariation=(obj)=>{
    for (var m in obj){
      var modifierId = obj[m].modifier_id;
      var variationId = obj[m].variation_id;
      if($rootScope.Cart.contents.length==0){
        return true;
      }else {
        for(var i in $rootScope.Cart.contents){
          if($rootScope.Cart.contents[i].options[modifierId] == variationId){
            if($rootScope.Cart.contents[i].stock_level > $rootScope.Cart.contents[i].quantity){
              return true;
            }else{
              $rootScope.error = {value: true, text:"you reached the maximum amount of this variation"};
              setTimeout(function(){
                $rootScope.error = {value: false, text:""};
                $rootScope.$apply();
              }, 2000);
              return false;
            }
          }
        }
        return true;
      }
    }
  }




  // $rootScope.updateCart = function(){
  //       $http({
  //         url: '/getCart',
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded'
  //         },
  //         transformRequest: transformRequestAsFormPost
  //       }).then(function(response){
  //         $rootScope.Cart = response.data;
  //
  //         console.log($rootScope.Cart);
  //         //attaching item id if cart>0
  //         if(!$rootScope.Cart.total_items==0){
  //           console.log("cart has some stuff");
  //           $rootScope.attachItemID($rootScope.Cart.contents);
  //         }
  //       });
  // }//updateCart






//attaching item function cart
  $rootScope.attachItemID=function(obj){
      Object.getOwnPropertyNames(obj).forEach(function(val, idx, array) {
        $rootScope.Cart.contents[val].item=val;
        // console.log(val + ' -> ' + obj[val]);
      });
  }



  $rootScope.thisProduct = function(id){
    $rootScope.detailUpdate(id);
    $location.path('/shop/product/'+id, true);
  };









}]);//shop controller









Shop.controller('detailCtrl', function($rootScope, $scope, $location, $routeParams, $route, $http){


  $rootScope.Detail={};
  $rootScope.selectedVariation = {};
  $rootScope.howManyVAriationsSelected = 0;
  $rootScope.page = "detail";
  $rootScope.Variations;
  $scope.sizeLoading = false;
  $scope.openSizechart=false;

  $scope.openSizechart_FN = ()=>{
    $scope.openSizechart=!$scope.openSizechart;
  }



  // var sku =$routeParams.detail;
  // $rootScope.detailUpdate(sku);

  $scope.$watch(function() {
    return $rootScope.Product;
  }, function(value) {
    if(value){
      $rootScope.detailUpdate($routeParams.detail);
    }
    // if(!$rootScope.Detail.id){
    //   $rootScope.detailUpdate($routeParams.detail);
    //   $scope.$apply();
    //   console.log("I loaded it again");
    //   console.log($rootScope.Detail);
    // }else{
    //   console.log("detail loaded correctly");
    //   console.log($rootScope.Detail);
    //   return false
    // }
  }, true);





  $scope.getVariationsLevel = (productId)=>{
    $scope.sizeLoading = true;
    $http({
      url: '/product/'+productId+'/variations/get',
      method: 'GET',
    }).then(function(response){
      $rootScope.Variations=response.data.result;
      $scope.sizeLoading = false;
      var n = 0;
      for (var m in $rootScope.Detail.modifiers){

        $scope.arrFromMyObj = Object.keys($rootScope.Detail.modifiers[m].variations).map(function(key) {
          return $rootScope.Detail.modifiers[m].variations[key];
        });
        $rootScope.Detail.modifiers[m].variations=$scope.arrFromMyObj;

        for (var v in $rootScope.Detail.modifiers[m].variations){

          for (var t in $rootScope.Variations){
            var key = Object.keys($rootScope.Variations[t].modifiers)[0];

            var title = $rootScope.Variations[t].modifiers[key].var_title;

            if(title==$rootScope.Detail.modifiers[m].variations[v].title){
              $rootScope.Detail.modifiers[m].variations[v].stock_level = $rootScope.Variations[t].stock_level;

              function findCherries(fruit) {
                return fruit.title === title;
              }
              var thisObj = $scope.orderSize.find(findCherries);
              $rootScope.Detail.modifiers[m].variations[v].index = thisObj.index;
            }
          }





        }

      }




    },function(error){
      console.log(error);
        $route.reload();

    });
  }



  $rootScope.detailUpdate = (sku) => {
    $rootScope.selectedVariation={};
    $rootScope.howManyVAriationsSelected = 0;
    $rootScope.Detail.total_variations=0;

    for (var i in $rootScope.Product){
      if ($rootScope.Product[i].sku == sku){
        $rootScope.Product[i].sku
        $rootScope.Detail=$rootScope.Product[i];
        $rootScope.Detail.total_variations=0;
        $rootScope.Detail.has_variation = $rootScope.has_variation;
        // $rootScope.pageLoading = false;
        $scope.getVariationsLevel($rootScope.Detail.id);

        var go = true;
        //has variation
        for (var m in $rootScope.Detail.modifiers){
          $rootScope.Detail.total_variations =$rootScope.Detail.total_variations+1;
          // if($rootScope.Detail.modifiers[i].id){$rootScope.has_variation=true;}else{$rootScope.has_variation=false;}
          $rootScope.Detail.has_variation = true;
          $rootScope.selectedVariation[m] =
            {
              open: true
            }
            go = false;

        }

        if(go==true){
          //does not have variation
          $rootScope.Detail.has_variation = false;
        }

      }
    }
  }



  // $rootScope.detailUpdate($routeParams.detail);



  $rootScope.showSelection = function(modifier_id){
    $rootScope.selectedVariation[modifier_id].open = !$rootScope.selectedVariation[modifier_id].open;
  }

  $rootScope.closeSelection = function(modifier_id){
    if($rootScope.selectedVariation[modifier_id].open == false){
      $rootScope.selectedVariation[modifier_id].open = true;
    }else{
      $rootScope.selectedVariation[modifier_id].open = false;
    }
  }



  $rootScope.thisVariation = function(id, modifier_id, modifier_title, variation_id, variation_title){
    var i=0;
    for ( i in $rootScope.Detail.modifiers){
      if($rootScope.Detail.modifiers[i].id==modifier_id){
        $rootScope.selectedVariation[i] =
          {
            id: id,
            modifier_id: modifier_id,
            modifier_title: modifier_title,
            variation_id: variation_id,
            variation_title: variation_title
          }
          if($rootScope.howManyVAriationsSelected<$rootScope.Detail.total_variations){
            $rootScope.howManyVAriationsSelected = $rootScope.howManyVAriationsSelected+1;
          }
      }
    }
  }



// $scope.orderSize=[
//   "25",
//   "26",
//   "27",
//   "28",
//   "29",
//   "30",
//   "31"
// ];
//


$scope.orderSize=[
  {
    title:"XS",
    type: 'string',
    index:0
  },
  {
    title:"xs",
    type: 'string',
    index:0
  },
  {
    title:"S",
    type: 'string',
    index:1
  },
  {
    title:"s",
    type: 'string',
    index:1
  },
  {
    title:"M",
    type: 'string',
    index:2
  },
  {
    title:"m",
    type: 'string',
    index:2
  },
  {
    title:"L",
    type: 'string',
    index:3
  },
  {
    title:"l",
    type: 'string',
    index:3
  },
  {
    title:"XL",
    type: 'string',
    index:4
  },
  {
    title:"xl",
    type: 'string',
    index:4
  },
  {
    title:"XXL",
    type: 'string',
    index:5
  },
  {
    title:"xxl",
    type: 'string',
    index:5
  },
  {
    title:"23",
    type: 'string',
    index:6
  },
  {
    title:"24",
    type: 'string',
    index:7
  },
  {
    title:"25",
    type: 'string',
    index:8
  },
  {
    title:"26",
    type: 'string',
    index:9
  },
  {
    title:"27",
    type: 'string',
    index:10
  },
  {
    title:"28",
    type: 'string',
    index:11
  },
  {
    title:"29",
    type: 'string',
    index:12
  },
  {
    title:"30",
    type: 'string',
    index:13
  },
  {
    title:"31",
    type: 'string',
    index:14
  },
  {
    title:"32",
    type: 'string',
    index:15
  },
  {
    title:"33",
    type: 'string',
    index:16
  },
  {
    title:"34",
    type: 'string',
    index:17
  },
  {
    title:"35",
    type: 'string',
    index:18
  },
  {
    title:"36",
    type: 'string',
    index:19
  },
  {
    title:"37",
    type: 'string',
    index:20
  },
  {
    title:"38",
    type: 'string',
    index:21
  },
  {
    title:"39",
    type: 'string',
    index:22
  },
  {
    title:"40",
    type: 'string',
    index:23
  },
  {
    title:"41",
    type: 'string',
    index:24
  },
  {
    title:"42",
    type: 'string',
    index:25
  },
  {
    title:"43",
    type: 'string',
    index:26
  },
  {
    title:"44",
    type: 'string',
    index:27
  },
  {
    title:"45",
    type: 'string',
    index:28
  }
]




// "S",
// "M",
// "L",
// "XL",
// "23",
// "24",
// "25",
// "26",
// "27",
// "28",
// "29",
// "30",
// "31"




});