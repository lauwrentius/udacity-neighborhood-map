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
  }

  displayMarkers(idArr) {
    for( var key in this.markers){
      var match = idArr.find(i=>i===key);
      if (match)
        this.markers[key].marker.setVisible(true);
      else
        this.markers[key].marker.setVisible(false);
    }
  }

  initMarkers(obj) {
    this.markers = {};

    for (var i = 0; i < obj.length; i++) {
      var marker = new google.maps.Marker({
        map: this.map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: obj[i].latlng,
        icon: this._icon1
      });
      this.markers[obj[i].id] = {
        marker: marker,
        venue: obj[i].venue};
      // this.infoContents.push(infoArr[i]);

      ((m,i) => {
        marker.addListener('click', () => {
          document.dispatchEvent(new CustomEvent("markerClicked", {"detail":  i}));
        });
      })(marker, obj[i].id);
    }
    this.fitMarkers();
  }

  setCurrentMarker(id) {
    for( var key in this.markers){
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
    }
    if(id === null){
      this.infoWindow.close();
      this.fitMarkers();
    }
  }

  fitMarkers() {
    if (this.markers.length == 0) {
      this.map.setCenter(this.initLatLng);
      this.map.setZoom(this.initZoom);
      return;
    }
    var bounds = null;
    for(var [key, m] of Object.entries(this.markers)){
      if(m.marker.getVisible()){
        if(bounds===null)
          bounds = new google.maps.LatLngBounds(
            m.marker.getPosition(),m.marker.getPosition());
        else
          bounds.extend(m.marker.getPosition());
      }
    }
    this.map.fitBounds(bounds,20);
  }

  _openInfoWindow(marker, content) {
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
  }
}
