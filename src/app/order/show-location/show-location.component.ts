import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js'

@Component({
  selector: 'app-show-location',
  templateUrl: './show-location.component.html',
  styleUrls: ['./show-location.component.css']
})
export class ShowLocationComponent implements OnInit {

  public lat;
  public lng;
  public zoom = 4;
  public origin: any;
  public destination: any;
  address: any = "";
  geoCoder
  isLoading =false
  constructor( private router: Router,private mapsAPILoader: MapsAPILoader) { 
     var rest_id = localStorage.getItem('rest_id');
     this.isLoading =true
     if(rest_id==null ){
       this.router.navigate(['/not-found'])
     }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.isLoading =false
  }

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.getAddress(this.lat, this.lng);
        this.router.navigate(['/order']);
      });
    }
  }

  getAddress(latitude, longitude) {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
      this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
        this.address = results[0].formatted_address
        var address = CryptoJS.AES.encrypt(this.address, '');
        localStorage.setItem('customer_address',address.toString());
      });

    })
  }

}
