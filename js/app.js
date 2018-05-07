var map, marker;
var count = 0;
var markers = [];
var temp = 5;
var type = ['food', 'cafe', 'hospital', 'library', 'park'];
var infoWindow, geocoder, service;
var wikiURL, wikiElem;
/***************************************************** 
  This function will call Wikipedia API asynchronously
  and provide a link to the wikipedia page about the
  location searched. It also informs the user if the
  request is not successful.
******************************************************/
function wiki(loc) {
  wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + loc + '&format=json&callback=wikiCallback';
  var wikiRequestTimeout = setTimeout(function() {
    alert('Failed to fetch Wiki Articles');
  }, 10000);
  $.ajax({
    method: 'GET',
    url: wikiURL,
    dataType: 'jsonp',
    success: function(data) {
      var articlesArr = data[1];
      wikiElem = "<div class='item article'><button class='ui inverted teal basic button' style='width: 100%;'><a target='blank' href='https://en.wikipedia.org/wiki/" + articlesArr[0] + "'>Wikipedia Article on " + articlesArr[0] + "</a></button></div>";
      $('div.menu-overwrite').append(wikiElem);
      clearTimeout(wikiRequestTimeout);
    }
  });
}
/******************************************************
  This function takes the places api result as argument
  and create markers on the locations returned by the
  request to the places api. It also call the populate
  Infowindow function for each marker and call the
  fillArray function defined in the viewmodel everytime
  the following function is called for the last type in
  the type array defined above.
********************************************************/
function createMarkers(result) {
  places = result.response.groups[0].items;
  for (var i = 0; i < places.length; i++) {
    var pos = {
      lat: places[i].venue.location.lat,
      lng: places[i].venue.location.lng
    };
    var rating = 0;
    if (places[i].rating) rating = places[i].rating;
    var photo;
    photo = 'http://www.tea-tron.com/antorodriguez/blog/wp-content/uploads/2016/04/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png';
    marker = new google.maps.Marker({
      position: pos,
      title: places[i].venue.name,
      animation: google.maps.Animation.DROP,
      id: markers.length,
      picture: photo,
      address:  places[i].venue.location.address,
      rating: places[i].venue.rating,
      type: [result.response.query],
      category: places[i].venue.categories[0].name
    });
    markers.push(marker);
    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    });
  }
  if (count == type.length - 1) {
    mdl.fillArray();
    showMarkers(markers);
  }
  if (count == type.length) count = 1;
  count++;
}
/********************************************************
  This function takes in address and return the latitude
  and longitude for the address by making client side 
  request to geocoder api using geocoder library provided
  by googlemaps. If request fails, user is notified.
*******************************************************/
function setLocation(address) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  mdl.markerList([]);
  $('div').remove('.article');
  wiki(address);
  geocoder.geocode({
    'address': address
  }, function(results, status) {
    if (status == 'OK') {
      var loc = results[0].geometry.location.toString();
      var locarray = loc.split('(')[1].split(',');
      var latitiude = parseFloat(locarray[0]);
      var longitude = parseFloat(locarray[1].split(')')[0]);
      var pos = {
        lat: latitiude,
        lng: longitude
      };
      map.setCenter(pos);
      findPlaces(pos, type);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
/********************************************************
  This function creates and initialise google
  map object and also creates geocoder, infowindow and 
  service objects.
*********************************************************/
function initMap() {
  var defaultLocation = {
    lat: 40.7413549,
    lng: -73.9980244
  };
  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 15,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_CENTER
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
  });
  geocoder = new google.maps.Geocoder();
  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
  findPlaces(defaultLocation, type);
  wiki('Newyork');
  autocom();
}
/**************************************************
  This function takes in latitude and longitude and 
  a type array and perform ajax request to
  foursquare api and the success function calls 
  createMarkers function and pass in the result of
  the request. If request fails user is notified.
**************************************************/
function findPlaces(loc, type) {
  for (var i = 0; i < type.length; i++) {
    var clientId ="3VU3JPF4MALSI0PRWMV1VEVPWXO0HXACAEJDDNSB5GDHH0ZG";
    var clientSecret = "YSBYZX0VSOEQO45P2D0MDM5OHKDFWKGSBUZ0JJXDK4S2W0AZ&v=20170801";
    var foursquareUrl = "https://api.foursquare.com/v2/venues/explore?limit=5&range=5000&ll="+loc.lat+","+loc.lng+"&client_id="+clientId+"&client_secret="+clientSecret+"&query="+type[i];
    $.ajax({
      url: foursquareUrl,
      method: 'GET',
      dataType: 'json',
      data: { 'place': type[i] },
      success: function(result) {
        createMarkers(result);
      }
    }).fail(function(jqXHR, textStatus) {
      alert("Foursquare api request request was not successful because of "+ textStatus);
    });
  }
}
/********************************************
  This function creates a autocomplete object
  taking location input box as an argument.
*********************************************/
autocom = function() {
  var input = document.getElementById('location');
  var options = {
    types: ['(cities)'],
    componentRestrictions: {
      'country': []
    }
  };
  autocomplete = new google.maps.places.Autocomplete(input, options);
};
/*********************************************
  This function set the map property for the
  markers to map element and also set the map
  bounds.
**********************************************/
function showMarkers(markers) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
/*********************************************** 
  This function sets the content of infowindow
  for each marker.
***********************************************/
function populateInfoWindow(marker, infoWindow) {
  if (infoWindow.marker != marker) {
    infoWindow.setContent('');
    infoWindow.marker = marker;
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
    infoWindow.setContent('<div class="ui card">' + '<div>' + '<img src=' + marker.picture + ' width="250px" height="150px">' + '</div>' + '<div class="content">' + '<a class="header">' + marker.title + '</a>' + '<div class="meta">' + marker.category + '</div>' + '<div class="description">' + 'Address: ' + marker.address + '</div>' + '</div>' + '<div class="extra content">' + 'Rating: ' + marker.rating + '/10' + '</div>'+'</div>');
    infoWindow.open(map, marker);
  }
}
/****************************************
This is a knockout observable object which
stores marker's id and title.
*****************************************/
var markerInfo = function(data) {
  this.id = ko.observable(data.id);
  this.title = ko.observable(data.title);
}
/* ***********************************************
  The following knockout viewmodel contains four 
  functions callmarkers, fillArray, markerAnimate,
  filterArray and two observable arrays place and
  markerList.
**************************************************/
var viewModel = function() {
  var self = this;
  self.site = ko.observable("Newyork");
  self.place = ko.observableArray(['food', 'cafe', 'hospital', 'library', 'park']);
  self.markerList = ko.observableArray([]);
  /**********************************************
    This function is called on the click on the
    location button and this further calls the set
    location function by passing in the location.
  ***********************************************/
  self.callmarkers = function() {
    type = ['food', 'cafe', 'hospital', 'library', 'park'];
    setLocation(self.site());
  };
  /**********************************************
    This function fills the markerList observable
    array with markerInfo objects.
  ***********************************************/
  self.fillArray = function() {
    self.markerList([]);
    for (var i = 0; i < markers.length; i++) {
      self.markerList.push(new markerInfo(markers[i]));
    }
  };
  /**********************************************
  This function animates the clicked marker and 
  opens up the respective infowindow.
  ***********************************************/
  self.markerAnimate = function(m) {
    for (var i = 0; i < markers.length; i++) {
      if (m.id() == markers[i].id) {
        for (var j = 0; j < markers.length; j++) {
          markers[j].setAnimation(null);
        }
        markers[i].setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(markers[i], infoWindow);
        break;
      }
    }
  };
  /*************************************************
  This function hides the markers for which the type
  is unselected and shows the markers for which the
  type is selected.
  *************************************************/
  self.filterMarkers = function() {
    var flag;
    if (self.place().length <= temp) {
      for (var i = 0; i < type.length;) {
        flag = 1;
        for (var j = 0; j < self.place().length; j++) {
          if (self.place()[j] == type[i]) flag = 0;
        }
        if (flag) {
          for (var k = 0; k < markers.length; k++) {
            if (markers[k].type.indexOf(type[i]) != -1) {
              markers[k].setMap(null);
            }
          }
          type.splice(i, 1);
        } else i++;
      }
    }
    if(self.place().length >= temp){
      for (var i = 0; i < self.place().length; i++) {
        flag = 1;
        for (var j = 0; j < type.length; j++) {
          if (type[j] == self.place()[i]) flag = 0;
        }
        if (flag) {
          type.push(self.place()[i]);
        }
      }
      for (var i = 0; i < type.length; i++) {
        for (var k = 0; k < markers.length; k++) {
          if (markers[k].type.indexOf(type[i]) != -1) {
            markers[k].setMap(map);
          }
        }
      }
    }
    self.markerList([]);
    for (var k = 0; k < markers.length; k++) {
      if (markers[k].map == map) self.markerList.push(new markerInfo(markers[k]));
    }
    temp = self.place().length;
  };
};
mdl = new viewModel();
ko.applyBindings(mdl);