var ko = require("knockout");
//$ = jQuery;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';

import  poi_data from './poi_data.json';

import Map from './js/Map';
import Poi from './js/Poi';

import './images/marker.png';
import './images/marker-hl.png';
import './index.html';
import './scss/style.scss';

var ViewModel = function() {
  this.poi_arr = ko.observableArray();
  this.poi_resolved = false;
  this.textFilter = ko.observable("");
  this.currentItem = ko.observable(null);

  google.maps.event.addDomListener(window, 'load', ()=>{
    this.map = new Map();
    this.InitPlaces();
  });

  this.InitPlaces = () => {
    var venueObjArr = [];
    for(var i=0; i<poi_data.length; i++){
      var poi = new Poi(poi_data[i].name, poi_data[i].id);
      this.poi_arr.push(poi);
      venueObjArr.push(poi.venueObj);
    }
    Promise.all(venueObjArr).then(val=>{
      this.poi_resolved = true;
      this.markers = this.map.initMarkers(
        this.poi_arr.slice().map(i=>i.latlng),
        this.poi_arr.slice().map(i=>i.venue));
      for(var i=0; i<this.markers.length; i++){
        (i => {
          marker.addListener('click', () => {
            console.log("ASDASDASD",i);
          });
        })(i);
      }
    }, rejected=>{
      console.log(rejected);
      this.alertsArr.push({error:rejected});
    });
  }
  // this.initItems = () => {
  this.item_click = item => {
    this.currentItem(item);
    console.log(item.venueObj);
    if(this.poi_resolved)
      this.map.setCurrentMarker(item.latlng);
  }

  this.isCurrentItem = item =>{
    if(item === this.currentItem())
      return true;
    return false;
  };

  this.poi_filterred = ko.computed(()=>{
    this.currentItem(null);
    var filtered = this.poi_arr.slice().filter(poi => {
      return (new RegExp(this.textFilter(),'i')).test(poi.name);
    });
    if(this.map){
      if(this.poi_resolved){
        var latlngArr = filtered.map(i=>{
          console.log(i);
          return i.latlng});
        console.log(latlngArr);
        this.map.displayMarkers(latlngArr)
      }
    }
    return filtered;
  }, this);


  this.alertsArr = ko.observableArray();

  this.dismissAlerts = (item) => {
    this.alertsArr.remove(item);
  }

};

ko.applyBindings(new ViewModel());
