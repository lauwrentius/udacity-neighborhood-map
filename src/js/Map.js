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
      zoom: this.initZoom
    });
    this.map.addListener('bounds_changed', () => {
      this._fitMarkers();
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

  displayMarkers(latlngArr) {
    for (var i = 0; i < this.markers.length; i++) {
      var match = latlngArr.find(m => {
        return this._isMarker(this.markers[i], m);
      });

      if (match)
        this.markers[i].setVisible(true);
      else
        this.markers[i].setVisible(false);
    }
  }

  initMarkers(latlngArr, infoArr) {
    this.markers = [];

    for (var i = 0; i < latlngArr.length; i++) {
      console.log(latlngArr[i].lat)
      var marker = new google.maps.Marker({
        map: this.map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: latlngArr[i],
        icon: this._icon1
      });
      this.markers.push(marker);
      this.infoContents.push(infoArr[i]);

      (i => {
        marker.addListener('click', () => {
          console.log(marker, i);
          this._setCurrentMarkerIdx(i);
        });
      })(i);
    }
    this._fitMarkers();

    return this.markers;
  }

  setCurrentMarker(latlng) {
    var idx = this.markers.findIndex(m => {
      return m.getPosition().equals(new google.maps.LatLng(latlng));
    });
    this._setCurrentMarkerIdx(idx);
  }

  _setCurrentMarkerIdx(idx) {
    for (var i = 0; i < this.markers.length; i++) {
      if (idx === i) {
        this.markers[i].setAnimation(google.maps.Animation.BOUNCE);
        (s => {
          setTimeout(() => {
            s.setAnimation(null);
          }, 1400);
        })(this.markers[i]);
        this.markers[i].setIcon(this._icon2);
        this._openInfoWindow(this.markers[i], this.infoContents[i]);
      } else {
        this.markers[i].setAnimation(null);
        this.markers[i].setIcon(this._icon1);
      }
    }
  }

  _fitMarkers() {
    if (this.markers.length == 0) {
      this.map.setCenter(this.initLatLng);
      this.map.setZoom(this.initZoom);
      return;
    }
    var bounds = new google.maps.LatLngBounds(
      this.markers[0].getPosition(),
      this.markers[0].getPosition());

    for (var i = 1; i < this.markers.length; i++)
      bounds.extend(this.markers[i].getPosition());
    this.map.fitBounds(bounds, 175);
  }

  _openInfoWindow(marker, content) {
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
  }

  _markerClick(evt) {
    console.log("MARKER", evt);
  }
}
