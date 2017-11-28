var ko = require("knockout");
//$ = jQuery;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';

import  poiData from './poi_data.json';

import Map from './js/Map';
import Poi from './js/Poi';

import './images/marker.png';
import './images/marker-hl.png';
import './index.html';
import './scss/style.scss';

var ViewModel = function() {
  this.poiArr = ko.observableArray();
  this.poiResolved = false;
  this.textFilter = ko.observable("");
  this.currentItem = ko.observable(null);

  google.maps.event.addDomListener(window, 'load', ()=>{
    this.map = new Map();
    this.InitPlaces();
  });

  this.InitPlaces = () => {
    var venueObjArr = [];
    for(var i=0; i<poiData.length; i++){
      var poi = new Poi(poiData[i].name, poiData[i].id);
      this.poiArr.push(poi);
      venueObjArr.push(poi.venueObj);
    }
    Promise.all(venueObjArr).then(val=>{
      this.poiResolved = true;
      this.markers = this.map.initMarkers(
        this.poiArr.slice().map(i=>{
          return {id: i.id,
            latlng: i.latlng,
            venue: i.venue};
        }));
      document.addEventListener("markerClicked", e=>{
        var poi = this.poiArr.slice().find(i=>i.id===e.detail);
        // console.log(e, this.poiArr, poi);
        this.itemClick(poi);
      });
    }, rejected=>{
      this.alertsArr.push({error:rejected});
    });
  }
  this.itemClick = item => {
    this.currentItem(item);
    if(this.poiResolved)
      this.map.setCurrentMarker(item.id);
  }

  this.isCurrentItem = item =>{
    if(item === this.currentItem())
      return true;
    return false;
  };

  this.poiFilterred = ko.computed(()=>{
    this.currentItem(null);
    if(this.map !== undefined)
      this.map.setCurrentMarker(null);

    var filtered = this.poiArr.slice().filter(poi => {
      return (new RegExp(this.textFilter(),'i')).test(poi.name);
    });
    if(this.map){
      if(this.poiResolved){
        var idArr = filtered.map(i=>{
          return i.id});
        this.map.displayMarkers(idArr);
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
