(function ($) {

var markerArray = Array();
var map;
var ge;

Drupal.behaviors.nodejs_geoloc = {
	attach: function (context, settings) {
		//$(window).load(Drupal.behaviors.mapInit);
		google.load('earth', '1', 
			{
				'callback': function(){ 
					google.earth.createInstance('map3d', Drupal.behaviors.nodejs_geoloc.initCB, Drupal.behaviors.nodejs_geoloc.failureCB);
				}
			}
		)
	},

	mapInit : function(){
		var myOptions = {
  			zoom: 8,
			center: new google.maps.LatLng(-34.397, 150.644),
  			mapTypeId: google.maps.MapTypeId.TERRAIN
		};

		// Create the Google Map, set options
		map = new google.maps.Map(document.getElementById("map3d"), myOptions);
	},

	initCB : function(instance){
		ge = instance;
	      	ge.getWindow().setVisibility(true);
	},

	failureCB : function(){
	},

	isMarker : function(uuid){
		for (var i = 0; i < markerArray.length; i++){
			if (markerArray[i].uuid = uuid){
				return i;
			}
		}
		return "false";
	},

	createEarthMarker : function(message){
		var placemark = ge.createPlacemark('');
		placemark.setName('  ' + message.author.charAt(0).toUpperCase() + message.author.slice(1));
		var point = ge.createPoint('');
		point.setLatitude(message.position.coords.latitude);
		point.setLongitude(message.position.coords.longitude);
		point.setAltitude(message.position.coords.altitude);		
		point.setAltitudeMode(ge.ALTITUDE_ABSOLUTE);
		placemark.setGeometry(point);

		var icon = ge.createIcon('');
		icon.setHref('http://188.165.192.213/game/gamesite/sites/all/modules/nodejs_geoloc/icon/icon.png');
		var style = ge.createStyle(''); //create a new style
		style.getIconStyle().setIcon(icon); //apply the icon to the style
		placemark.setStyleSelector(style); //apply the style to the placemark

		
		ge.getFeatures().appendChild(placemark);
		markerArray.push({uuid:message.device, marker:placemark});

		// Get the current view.
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

		// Set new latitude and longitude values.
		//lookAt.setLatitude(message.position.coords.latitude);
		//lookAt.setLongitude(message.position.coords.longitude);

		// Update the view in Google Earth.
		//ge.getView().setAbstractView(lookAt);

		var camera = ge.getView().copyAsCamera(ge.ALTITUDE_RELATIVE_TO_GROUND);
		camera.setLatitude(message.position.coords.latitude);
		camera.setLongitude(message.position.coords.longitude);
		camera.setAltitude(message.position.coords.altitude);
		ge.getView().setAbstractView(camera);
	},

	createMarker : function(message){
		var myLatLng = new google.maps.LatLng(message.position.coords.latitude, message.position.coords.longitude);
		var marker = new google.maps.Marker({
      			position:  myLatLng,
      			map: map,
			uuid : message.device,
  		});
		markerArray.push(marker);
		marker.setMap(map);
		map.panTo( myLatLng );
	},

	updateEarthMarker : function(message){
		var point = markerArray[message.markId].marker.getGeometry();
		point.setLatitude(message.position.coords.latitude);
		point.setLongitude(message.position.coords.longitude);
		point.setAltitude(message.position.altitude);
	},

	updateMarker : function(message){
		var myLatLng =  new google.maps.LatLng(message.position.coords.latitude, message.position.coords.longitude);
		markerArray[message.markId].setPosition(myLatLng);
		map.panTo( myLatLng );		
	}	
}	


Drupal.Nodejs.presenceCallbacks = {
  callback: function(message){
	if (message.type != 'drupaluser'){
		if (message.event == 'online'){
			$("#trackStatus_" + message.uid).html(" Trackeur connecté ").removeClass('statusDisconnect').addClass('statusConnect');
		}
		else{						
			$("#trackStatus_" + message.uid).html(" Trackeur non connecté ").removeClass('statusConnect').addClass('statusDisconnect');
		}
	}
  }
}

Drupal.Nodejs.callbacks.nodejsGeoloc = {
  callback: function (message) {
	// Check if this marker uuid already exist.
	var markId = Drupal.behaviors.nodejs_geoloc.isMarker(message.device);
	if (markId == "false"){
		//Drupal.behaviors.nodejs_geoloc.createMarker(message);
		Drupal.behaviors.nodejs_geoloc.createEarthMarker(message);
	}
	else{
		message.markId = markId;  
		Drupal.behaviors.nodejs_geoloc.updateEarthMarker(message);
	}
  }
};



})(jQuery);

