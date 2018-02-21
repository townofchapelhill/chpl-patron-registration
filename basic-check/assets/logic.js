// Stores input values in patron object globally
var patron = {};

// function to fill in city & state fields upon successful entry of a valid zip code
$(document).ready(function() {
    $("#zipCode").keyup(function() {
        var zip = $(this);

        // AJAX call to retrieve city & state info from Arcgis
        // data is then split and placed into correct fields
        if (zip.val().length === 5) {
            $.ajax({
                url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text=" + zip.val() + "&f=pjson",
                // cache: false,
                dataType: "json",
                type: "GET",
                success: function(result, success) {
                    var parsedData = result.locations[0].name.split(', ');
                    console.log(parsedData);
                    $("#city").val(parsedData[1]).show();
                    $("#state").val(parsedData[2]).show();
                    $("#cityLabel").show();
                    $("#stateLabel").show();
                }
            });
        };
    });
});

// Captures user info from input fields & clears them upon form submittal
function captureInfo() {
    
    patron.address = $("#address").val().trim(),
    patron.zipCode = $("#zipCode").val().trim(),
    patron.city = $("#city").val().trim(),
    patron.state = $("#state").val().trim() 
    userDetails();
    $(".userInput").val('');
};

// Converts user input into useable query string for Arcgis API
function userDetails(address, city, state, zip) {
    var urlAddress = patron.address.split(' ').join("+");
	var urlCity = patron.city.split(' ').join("+");
	var urlState = patron.state.split(' ').join("+");
    var urlZip = patron.zipCode;
    
    var addressString = urlAddress + "%2C+" + urlCity + "%2C+" + urlState + "+" + urlZip;

    // AJAX call to retrieve lat & long coordinates
    $.ajax({
		type: "GET",
		url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text=" + addressString + "&f=pjson",
		success: function(d) {
			var result = d;
			var xCoords = result.locations[0].feature.geometry.x;
			var yCoords = result.locations[0].feature.geometry.y;

            // Additional AJAX call to check whether sepcified address lies within correct bounndary
			$.ajax({
				url: "https://gisweb.townofchapelhill.org/arcgis/rest/services/CorporateData/JurisdictionalLimits/MapServer/0/query?geometry=" + xCoords + "%2C" + yCoords + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=102100&returnCountOnly=true&f=json"	
			}).done(function(response) {
                // 1 for yes, 0 for no
                if (response.count === 0) {
                    $("#responseInfo").text("Address not within specified boundary").css("color", "red");
                } else {
                    $("#responseInfo").text("\u2714 Address checks out, move along").css("color", "green");
                };
            });
		},
	  	dataType: "json"
	});
};

// Allows captureInfo() & userDetails() to be fired upon pressing of enter button
$(document).keypress(function(e) {
    if (e.which === 13) {
        captureInfo();
    };
});


