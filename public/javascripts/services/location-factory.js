angular.module('cc.location-factory',[])
.factory('location', ['$http','$geolocation','$window', function($http,$geolocation,$window){
	
	if (typeof(Number.prototype.toRad) === "undefined") {
	  Number.prototype.toRad = function() {
	    return this * Math.PI / 180;
	  }
	}
	var location = {
		setPosition:function(position){
			var currPosition = {
				latitude:null,
				longitude:null
			};
		  	$window.localStorage['latitude'] = position.latitude;
		  	$window.localStorage['longitude'] = position.longitude;
		},
		getPosition:function(){
			currPosition = {
				latitude:$window.localStorage['latitude'],
				longitude:$window.localStorage['longitude']
			}
			return currPosition;
		},
		calculateDistance:function(lon1, lat1, lon2, lat2) {
		  var R = 6371; // Radius of the earth in km
		  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
		  var dLon = (lon2-lon1).toRad(); 
		  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
		          Math.sin(dLon/2) * Math.sin(dLon/2); 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var d = R * c; // Distance in km
		  var m = d*0.000621371192; //Distance in miles
		  return m;
		},
		watchPosition:function($scope){
			$geolocation.watchPosition({
		        timeout: 60000,
		        maximumAge: 250,
		        enableHighAccuracy: true
	      	});

	      	$scope.myPosition = $geolocation.position;

	      	$scope.$watch('myPosition.coords.latitude',function(newVal,oldVal){
	      		if(newVal !== oldVal){
      				$http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+$scope.myPosition.coords.latitude+","+$scope.myPosition.coords.longitude+"&sensor=true")
        				.success(function(data){
          					$scope.loadingLocation = false;
          					location.setPosition(data.results[0]);
      					}
      				);
    			}
	      	})

		}

		// /** Converts numeric degrees to radians */
		// if (typeof(Number.prototype.toRad) === "undefined") {
		//   Number.prototype.toRad = function() {
		//     return this * Math.PI / 180;
		//   }
		// }
	}
	return location;
}]);