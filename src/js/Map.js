/**
* @description Map to controls the google map portion.
*/
export default class Map {
  constructor() {
    this.initLatLng = {
      lat: 47.6090857175388,
      lng: -122.18652458190917
    };
    this.initZoom = 14;

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this.initLatLng,
      draggable: false,
      zoomControl: false,
      zoom: this.initZoom,
      maxZoom: this.initZoom
    });
    this.markers = [];
    this.infoContents = [];
    this.infoWindow = new google.maps.InfoWindow({
      zIndex: 0,
      disableAutoPan: false
    });
    this._icon1 = './images/marker.png';
    this._icon2 = './images/marker-hl.png';

    this.infoWindow.addListener('closeclick', ()=>this.fitMarkers());
  }

  /**
  * @description Initializes markers from Array of Objects
  * @param {Object[]} objArr - Array of of objects with props
  *   id - String, unique id for the specified marker
  *   latlng - Object literal of Lat Lng position of the marker
  *   venue - HTML formatted additonal data to be displayed on the infoWindow.
  */
  initMarkers(objArr) {
    this.markers = {};

    for (let i = 0; i < objArr.length; i++) {
      let marker = new google.maps.Marker({
        map: this.map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: objArr[i].latlng,
        icon: this._icon1
      });
      this.markers[objArr[i].id] = {
        marker: marker,
        venue: objArr[i].venue};

      ((m,i) => {
        marker.addListener('click', () => {
          document.dispatchEvent(new CustomEvent("markerClicked", {"detail":  i}));
        });
      })(marker, objArr[i].id);
    }
    this.fitMarkers();
  }

  /**
  * @description Displays the markers that listed on the idArr and hodes the remaining ones.
  * @param {String[]} idArr - marker id to be displayed.
  */
  displayMarkers(idArr) {
    Object.keys(this.markers).forEach((key) => {
      let match = idArr.find(i=>i===key);
      if (match)
        this.markers[key].marker.setVisible(true);
      else
        this.markers[key].marker.setVisible(false);
    });
  }

  /**
  * @description Sets the specified marker as a current marker based on it's id.
  * @param {String} id - marker id.
  */
  setCurrentMarker(id) {
    Object.keys(this.markers).forEach((key) => {
      if(key === id){
        this.markers[key].marker.setAnimation(google.maps.Animation.BOUNCE);
        (m => {
          setTimeout(() => {
            m.setAnimation(null);
          }, 1400);
        })(this.markers[key].marker);
        this.markers[key].marker.setIcon(this._icon2);
        this._openInfoWindow(this.markers[key].marker, this.markers[key].venue);
        this.map.setCenter(this.markers[key].marker.getPosition());
      }else{
        this.markers[key].marker.setAnimation(null);
        this.markers[key].marker.setIcon(this._icon1);
      }
    });
    if(id === null){
      this.infoWindow.close();
      this.fitMarkers();
    }
  }

  /**
  * @description Move map to fit all of the marker that are currently being displayed.
  */
  fitMarkers() {
    let bounds = null;
    for(let [key, m] of Object.entries(this.markers)){
      if(m.marker.getVisible()){
        if(bounds===null)
          bounds = new google.maps.LatLngBounds(
            m.marker.getPosition(),m.marker.getPosition());
        else
          bounds.extend(m.marker.getPosition());
      }
    }
    // if(bounds == null)
    if (this.markers.length == 0 || bounds === null)
      return this._initMapPos();

    this.map.fitBounds(bounds,20);
  }

  /**
  * @description Resets the map position back to it's original position.
  */
  _initMapPos(){
    this.map.setCenter(this.initLatLng);
    this.map.setZoom(this.initZoom);
  }

  /**
  * @description Open a infoWindow on the specified marker.
  * @param {Marker} - Google map marker object
  * @param {String} - HTML formatted string to be disp on the infoWindow
  */
  _openInfoWindow(marker, content) {
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
  }
}
