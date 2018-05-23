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
				url: "https://gisweb.townofchapelhill.org/arcgis/rest/services/MapServices/ToCH_OrangeCo_CombinedLimits/MapServer/0/query?geometry=" + xCoords + "%2C" + yCoords + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=102100&returnCountOnly=true&f=json"	
			}).done(function(response) {
                // 1 for yes, 0 for no
                console.log(response)
                if (response.count === 0) {
                    $("#responseInfo").text("\u2717 Address not within boundary").css("color", "red");
                } else {
                    $("#responseInfo").text("\u2714 Address within boundary").css("color", "green");
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

var style = [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#e9e9e9"
        },
        {
            "lightness": 17
        }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#f5f5f5"
        },
        {
            "lightness": 20
        }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
        {
            "color": "#ffffff"
        },
        {
            "lightness": 17
        }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
        {
            "color": "#ffffff"
        },
        {
            "lightness": 29
        },
        {
            "weight": 0.2
        }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#ffffff"
        },
        {
            "lightness": 18
        }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#ffffff"
        },
        {
            "lightness": 16
        }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#f5f5f5"
        },
        {
            "lightness": 21
        }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#dedede"
        },
        {
            "lightness": 21
        }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
        {
            "visibility": "on"
        },
        {
            "color": "#ffffff"
        },
        {
            "lightness": 16
        }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
        {
            "saturation": 36
        },
        {
            "color": "#333333"
        },
        {
            "lightness": 40
        }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
        {
            "visibility": "off"
        }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
        {
            "color": "#f2f2f2"
        },
        {
            "lightness": 19
        }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
        {
            "color": "#fefefe"
        },
        {
            "lightness": 20
        }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
        {
            "color": "#fefefe"
        },
        {
            "lightness": 17
        },
        {
            "weight": 1.2
        }
        ]
    }
    ];

function initMap() {
    var pubLib = {lat: 35.931839, lng: -79.0365381};
    var map = new google.maps.Map(document.getElementById('google-map'), {
      zoom: 14,
      center: pubLib,
      styles: style
    });
    var marker = new google.maps.Marker({
      position: pubLib,
      map: map
    });
};

function onlyNos(e, t) {

    try {

        if (window.event) {

            var charCode = window.event.keyCode;

        }

        else if (e) {

            var charCode = e.which;

        }

        else { return true; }

        if (charCode > 31 && (charCode < 48 || charCode > 57)) {

            return false;

        }

        return true;

    }

    catch (err) {

        alert(err.Description);

    };

};

