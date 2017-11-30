/**
 * Gather all dependencies.
 */
let ko = require("knockout");

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import poiData from './poi_data.json';

import Map from './js/Map';
import Poi from './js/Poi';

import './images/marker.png';
import './images/marker-hl.png';
import './index.html';
import './scss/style.scss';

/**
 * @description VIEW MODEL Porion of the app.
 */
let ViewModel = function() {
  this.poiResolved = false;
  this.poiArr = ko.observableArray();
  this.textFilter = ko.observable("");
  this.currentItem = ko.observable(null);
  this.alertsArr = ko.observableArray();

  /**
   * @description Init Map object. Callback for the Google map load.
   */
  this.initMap = () => {
    this.map = new Map();
    this.InitPlaces();
    $(window).resize(() => {
      this.map.fitMarkers();
    });
  };

  /**
   * @description Callback for the Google map error.
   */
  this.gMapError = (e) => {
    this.alertsArr.push({error:`<b>Google Map Error:</b> ${e.type}`});
  };

  /**
   * @description Init the location of Point of interests (Poi).
   * Create an array of Poi objects, which in turn makes an ajax call to foursquare API.
   * Push alerts to alertsArr observableArray whever the API call failed.
   * Once all the data from foursquare is completed, passes the datas to Map objects to display the markers.
   */
  this.InitPlaces = () => {
    let venueObjArr = [];
    for (let i = 0; i < poiData.length; i++) {
      let poi = new Poi(poiData[i].name, poiData[i].id);
      this.poiArr.push(poi);
      venueObjArr.push(poi.venueObj);
    }
    Promise.all(venueObjArr).then(val => {
      this.poiResolved = true;
      this.markers = this.map.initMarkers(
        this.poiArr.slice().map(i => {
          return {
            id: i.id,
            latlng: i.latlng,
            venue: i.venue
          };
        }));
      document.addEventListener("markerClicked", e => {
        let poi = this.poiArr.slice().find(i => i.id === e.detail);
        this.itemClick(poi);
      });
    }, rejected => {
      this.alertsArr.push({
        error: rejected
      });
    });
  }

  /**
   * @description Click function whenever the user clicks one of the Poi on the list.
   * @param {Poi} item - the poi that's clicked.
   */
  this.itemClick = item => {
    this.currentItem(item);
    $("#bs-navbar-collapse").collapse('hide');
    if (this.poiResolved)
      this.map.setCurrentMarker(item.id);
  }

  /**
   * @description Check whether/not the item is the current Poi on the list.
   * @param {Poi} item - the poi.
   * @returns {boolean} - true if it's the current item
   */
  this.isCurrentItem = item => {
    if (item === this.currentItem())
      return true;
    return false;
  };

  /**
   * @description Knockout computed observable. That displays the Poi filtered list.
   * @returns {Poi[]} - array of Poi that's being displayed on the list
   */
  this.poiFilterred = ko.computed(() => {
    this.currentItem(null);
    if (this.map !== undefined)
      this.map.setCurrentMarker(null);

    let filtered = this.poiArr.slice().filter(poi => {
      return (new RegExp(this.textFilter(), 'i')).test(poi.name);
    });
    if (this.map) {
      if (this.poiResolved) {
        let idArr = filtered.map(i => {
          return i.id
        });
        this.map.displayMarkers(idArr);
      }
    }
    return filtered;
  }, this);

  /**
   * @description Dismiss alert prompts (removes the alerts from the array)
   * @returns {Object} - alert object to be removed.
   */
  this.dismissAlerts = (item) => {
    this.alertsArr.remove(item);
  }
};

/**
 * Data binding for VM
 */
let appVM = new ViewModel();
ko.applyBindings(appVM);

/**
 * Exports wepback library bundle for google map callback
 */
export {
  appVM
}
