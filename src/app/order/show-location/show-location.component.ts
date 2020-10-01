import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js'
import { OrderService } from '../order.service';

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
  isLoading = false
  constructor(private router: Router, private mapsAPILoader: MapsAPILoader, private orderService: OrderService) {
    var rest_id = localStorage.getItem('rest_id');

    if (rest_id == null) {
      this.router.navigate(['/not-found'])
    }
    if (localStorage.getItem('customer_address')) {
      this.router.navigate(['/order'])
    }

    this.get_all_rest_data()

  }

  ngOnInit(): void {
  }

  get_all_rest_data() {
    this.isLoading = true
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        this.isLoading = false
        // console.log(res.data, 'ifff')
        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color

      } else {
        this.isLoading = false
        // console.log('ellls')
        // this.router.navigate(['/not-found'])
      }
    });
  }

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        var latitude = CryptoJS.AES.encrypt(String(this.lat), '');
        localStorage.setItem('lat', latitude.toString());

        var longitude = CryptoJS.AES.encrypt(String(this.lng), '');
        localStorage.setItem('lng', longitude.toString());
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
        localStorage.setItem('customer_address', address.toString());
      });

    })
  }

}
