/**
* @description Poi class for handling AJAX requests and formatting the result.
* @constructor Requires id and name of the Poi
* @param {String} name - of the location.
* @param {String} id - foursquare id to the location.
*/
export default class Poi{
  constructor(name, id){
    let url = 'https://api.foursquare.com/v2/venues/';
    let CLIENT_ID = 'F1UF5L3K4YDMWZPWXGWORLUNK05NVMNQLVURVRCEQ4C4IQMN';
    let CLIENT_SECRET = 'CDUCLDX4NVL5WSR5TXP3TXUHNH1KMJDVPB3WDHPFZLQUVBCJ';
    let YYYYMMDD = '20171101';

    this.name = name;
    this.id = id;
    this.marker = null;
    this.venueObj = new Promise((resolve,reject) => {
      let jqxhr = $.ajax({
        url: url+id,
        data: {client_id: CLIENT_ID, client_secret: CLIENT_SECRET, v: YYYYMMDD},
        success: (result) => {
          let _v = result.response.venue;

          this.latlng = {
            'lat': _v.location.lat,
            'lng': _v.location.lng
          };
          this.venue = this._formatVenue(_v);
          resolve(_v);

        }}).fail(result => {
          let response = result.responseJSON.meta;
          reject(`${response.code} <b>${response.errorType}</b><br />
            ${response.errorDetail}`);
        });
        return this.venue;
    });
    /**
    * Formats the venue to be displayed.
    */
    this._formatVenue = (obj) => {
      let cats = obj.categories.map(c=>c.name).join(', ');
      return `<div class="info-content">
        <img class="img-thumbnail" src="${obj.bestPhoto.prefix}36${obj.bestPhoto.suffix}" />
        <a href="${obj.canonicalUrl}" target="_blank">
        <b>${obj.name}</b></a><br />
        ${cats}<br />
        <span class="${(obj.rating===undefined)?'hidden':''}">
          Rating: <span style="color:#${obj.ratingColor};">${obj.rating}
        </span><br /></span>
        <a href="https://www.google.com/maps/search/?api=1&query=${obj.location.lat},${obj.location.lng}" target="_blank">Get Direction</a><br />
        </div>`
    }
  }
}
