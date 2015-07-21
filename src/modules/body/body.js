/**
 * Created by brenden on 7/19/2015.
 */
angular.module("bodyModule",function($scope){
    $scope.name="asdfasdf";
})
.directive("testDirective",function(){
    return{
        templateUrl : "modules/body/test.template.html",
        restrict : "A",
        scope : {},
        link : function(scope,element,attrs){
            scope.name = "Some Kind Of Test Lorem Ipsum and Stuff AND TEST AND ANOTHER TEST AND";
        }
    }
});