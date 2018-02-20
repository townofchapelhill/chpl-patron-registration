var patron = {};

function captureInfo() {
    
    patron.address = $("#address").val().trim(),
    patron.zipCode = $("#zipCode").val().trim(),
    patron.city = $("#city").val().trim(),
    patron.state = $("#state").val().trim() 
    console.log(patron);
    userDetails();
};

 function userDetails(address, city, state, zip) {
    var urlAddress = patron.address.split(' ').join("+");
	var urlCity = patron.city.split(' ').join("+");
	var urlState = patron.state;
    var urlZip = patron.zipCode;
    
    var addressString = urlAddress + "%2C+" + urlCity + "%2C+" + urlState + "+" + urlZip;
    console.log(addressString);

    $.ajax({
		type: "GET",
		url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text=" + addressString + "&f=pjson",
		success: function(d) {
			var result = d;
			var xCoords = result.locations[0].feature.geometry.x;
			var yCoords = result.locations[0].feature.geometry.y;
            console.log(result);
            console.log(xCoords);
			console.log(yCoords);

			$.ajax({
				url: "https://gisweb.townofchapelhill.org/arcgis/rest/services/CorporateData/JurisdictionalLimits/MapServer/0/query?geometry=" + xCoords + "%2C" + yCoords + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=102100&returnCountOnly=true&f=json"	
			}).done(function(response) {
                console.log(response);
                if (response.count === 0) {
                    alert("Address not within specified boundary");
                } else {
                    alert("Address checks out, move along");
                };
            });
		},
	  	dataType: "json"
	});
};


