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

  displayMarkers(latlngArr){
    for(var i=0;i<this.markers.length;i++){
      var match = latlngArr.find(m=>{
        return this.markers[i].getPosition().equals(new google.maps.LatLng(m));
      });
      if(match)
        this.markers[i].setVisible(true);
      else
        this.markers[i].setVisible(false);
    }
  }

  addMarker(latlng){
    this.markers.push(new google.maps.Marker({
      map: this.map,
      draggable: false,
      animation: google.maps.Animation.DROP,
      position: latlng
    }));
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
    this.marker = null;
    this.venue = new Promise( (resolve,reject) => {
      $.getJSON(url+id,
        {client_id: CLIENT_ID, client_secret: CLIENT_SECRET, v: YYYYMMDD},
        (result) => {
          //console.log(result);
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
  }
}


var ViewModel = function() {
    this.poi_arr = ko.observableArray();
    this.textFilter = ko.observable("");
    this.currentItem = ko.observable(null);

    google.maps.event.addDomListener(window, 'load', ()=>{
      this.map = new Map();
      this.InitPlaces();
    });

    this.InitPlaces = () => {
      console.log("init POI");
      for(var i=0; i<poi_data.length; i++){
        var poi = new PoI(poi_data[i].name, poi_data[i].id);
        this.poi_arr.push(poi);
        poi.latlng.then(latlng=>{
          if(latlng)
            this.map.addMarker(latlng);
        });
      }
    }

    this.item_click = item => {
      this.currentItem(item);
    }
    this.isCurrentItem = item=>{
      // console.log(item,this.currentItem());
      if(item === this.currentItem())
        return true;
      return false;
    };

    this.poi_filterred = ko.computed(()=>{
      var filtered = this.poi_arr.slice().filter(poi => {
        return (new RegExp(this.textFilter(),'i')).test(poi.name);
      });
      if(this.map){
        var latlngArr = filtered.map(i=>{return i.latlng});
        Promise.all(latlngArr).then(val=>{
          // console.log("ALL",x);
          this.map.displayMarkers(val);
        })
      }
      return filtered;
    }, this);
};


ko.applyBindings(new ViewModel());
