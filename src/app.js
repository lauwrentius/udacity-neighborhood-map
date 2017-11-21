var ko = require("knockout");
//$ = jQuery;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';

var poi_data = require("./poi_data.json");

require('./index.html');
require('./scss/style.scss');

class Map{
  constructor(){
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 47.6090857175388, lng: -122.18652458190917},
      zoom: 14
    });
    this.markers = [];
  }
  addMarker(latlng){
    latlng.then(val=>{
      if(!val) return;
      
      this.markers.push(new google.maps.Marker({
        map: this.map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: val
      }));
    });
  }
}

class PoI{
  constructor(name, id){
    let url = 'https://api.foursquare.com/v2/venues/';
    let CLIENT_ID = 'F1UF5L3K4YDMWZPWXGWORLUNK05NVMNQLVURVRCEQ4C4IQMN';
    let CLIENT_SECRET = 'CDUCLDX4NVL5WSR5TXP3TXUHNH1KMJDVPB3WDHPFZLQUVBCJ';
    let YYYYMMDD = '20171101';

    this.name = name;
    this.id = id;
    this.venue = new Promise( (resolve,reject) => {
      $.getJSON(url+id,
        {client_id: CLIENT_ID, client_secret: CLIENT_SECRET, v: YYYYMMDD},
        (result) => {
          console.log(result);
          resolve(result.response.venue);
        }).fail(function(result){
          console.log('FAIL',result);
          reject(result);
        });
    });
  }
  get latlng(){
    return this.venue.then(val=>{
      return {lat:val.location.lat,lng:val.location.lng};
    }, val=>{
      console.log("FAIL",val);
      return null;
    });

    // return this.venue
    // return this.venue.then({lat: this.venue.location.lat, lng: this.venue.location.lat});
    //return this.latlng;
  }
  set marker(marker){
    this.marker = marker;
  }
}


var ViewModel = function() {
    this.poi_arr = ko.observableArray();
    google.maps.event.addDomListener(window, 'load', ()=>{
      this.map = new Map();
      this.InitPlaces();
    });

    this.InitPlaces = () => {
      console.log("init POI");
      for(var i=0; i<poi_data.length; i++){
        var poi = new PoI(poi_data[i].name, poi_data[i].id);
        this.poi_arr.push(poi);
        console.log("-->",poi);
        this.map.addMarker(poi.latlng);
      }
    }

// console.log( this.poi_arr );

    this.textFilter = ko.observable("");
    this.poi_filterred = ko.computed( ()=>{
      return this.poi_arr.slice().filter(poi => {
        return poi.name.match(new RegExp(this.textFilter(),'i'));
      });
    }, this);
};

// function initMarker(map){
//   for(var i=0; i<poi_data.length; i++){
//     //console.log
//     poi_data[i].marker = new google.maps.Marker({
//       map: map,
//       draggable: false,
//       animation: google.maps.Animation.DROP,
//       position: {lat: poi_data[i].lat, lng: poi_data[i].lng}
//     });
//   }
// }
//var map;
// function initMap() {
//   var map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: 47.6090857175388, lng: -122.18652458190917},
//     zoom: 14
//   });

  // google.maps.event.addDomListener(window, 'load', function(){
  //   console.log("INIT");
  //   //initMarker(map);
  // });
  // map.addListener('dragend', function() {
  //   console.log(map.getCenter().lat(),map.getCenter().lng());
  // });

  //return map;
//}
// window.onload = function(){
//   console.log("WINDOW LOAD");
//   var map = initMap();
//   initMarker(map);
// }
ko.applyBindings(new ViewModel());




// initMap();
// This makes Knockout get to work
