
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-address-popup',
  templateUrl: './address-popup.component.html',
  styleUrls: ['./address-popup.component.css']
})
export class AddressPopupComponent implements OnInit {

  angForm: FormGroup;
  display: String;
  displaysuccess: String;
  themeCondition
  themeView
  customer_address
  banner
  logo
  restName
  restAddress
  minimumOrderValue
  img_url = UrlSetting.image_uri

  public lat;
  public lng;
  public zoom = 4;
  public origin: any;
  public destination: any;
  address: any = "";
  web_site: any = "";
  city: any = "";
  zip_code: any = "";
  contactNumber: any = "";
  alternateNumber: any = "";
  res: string[];
  public geoCoder;
  landmark
  submitted = false;
  userId;
  popupdata;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService, private mapsAPILoader: MapsAPILoader, private _ngZone: NgZone, private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddressPopupComponent>) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }

    this.angForm = this.fb.group({
      address: ['', Validators.required, Validators.minLength(4)],
    });

    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))

      // // console.log(data, 'lll')
      this.address = data.address
    }

    this.get_all_rest_data();
    this.setCurrentLocation();
  }

  @ViewChild('search', { static: false }) searchElementRef: ElementRef;

  ngOnInit() {
    //this.setCurrentLocation();

    this.findAdress();
  }

  get f() { return this.angForm.controls; }

  get_all_rest_data() {
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {

        this.themeView = res.data.theme_view
        if (this.themeView == "1") {       //1=listview in  and 2= gridmeans
          this.themeCondition = false
        } else {
          this.themeCondition = true
        }

        this.banner = res.data.rest_banner
        this.logo = res.data.rest_logo
        this.restName = res.data.rest_name
        this.restAddress = res.data.rest_full_address
        this.minimumOrderValue = res.data.minimum_order_value

        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color

      } else {
        this.router.navigate(['/not-found'])
      }
    });
  }



  onSubmit() {
    if ((this.address || '').trim().length != 0) {
      var encrypted_order_type = CryptoJS.AES.encrypt(this.address, '');
      localStorage.setItem('customer_address', encrypted_order_type.toString());
      // localStorage.removeItem('addressPickup')
      this.dialogRef.close();
      var latitude = CryptoJS.AES.encrypt(String(this.lat), '');
      localStorage.setItem('lat', latitude.toString());

      var longitude = CryptoJS.AES.encrypt(String(this.lng), '');
      localStorage.setItem('lng', longitude.toString());
    } else {
      // // console.log(this.angForm.controls.address, '00000000', address.length);
      if (this.angForm.invalid) {
        return false;
      }
      // this.submitted = false;
    }

  }



  onKeypressEvent(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onReset() {
    this.submitted = false;
    this.angForm.reset();
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if (localStorage.getItem('lat') && localStorage.getItem('lng')) {
      const latitude = CryptoJS.AES.decrypt(localStorage.getItem('lat'), '').toString(CryptoJS.enc.Utf8);
      const longitude = CryptoJS.AES.decrypt(localStorage.getItem('lng'), '').toString(CryptoJS.enc.Utf8);

      // this.UserData= data
      // console.log(Number(latitude), Number(longitude))
      // this.userName= data.user_name
      // this.email= data.user_email
      this.lat = Number(latitude);
      this.lng = Number(longitude);
      this.zoom = 14;
      this.getAddress(Number(latitude), Number(longitude));
    }else{
      this.lat = Number(25.276987);
      this.lng = Number(55.296249);
      this.zoom = 14;
      this.getAddress(25.276987, 55.296249);
    }

  }

  findAdress() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this._ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // // console.log(place, "*");
          var loop = place.address_components;
          loop.forEach(element => {
            if (element.types[0] == 'locality') {
              (element.long_name != undefined) ? this.city = element.long_name : this.city = '';
              // // console.log("city1", element.long_name)
            }
            if (element.types[0] == 'postal_code') {
              (element.long_name != undefined) ? this.zip_code = element.long_name : this.zip_code = '';
              // // console.log("zip_code", element.long_name)
            }
          });
          (place.formatted_address != undefined) ? this.address = place.formatted_address : this.address = '';
          (place.formatted_phone_number != undefined) ? this.contactNumber = place.formatted_phone_number : this.contactNumber = '';
          (place.website != undefined) ? this.web_site = place.website : this.web_site = '';
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.zoom = 14;
        });
      });
    });
  }

  markerDragEnd($event: MouseEvent) {
    let coords = JSON.stringify($event);
    let coords3 = JSON.parse(coords);
    // // console.log(coords3)
    this.lat = coords3.latLng.lat;
    this.lng = coords3.latLng.lng;
    this.getAddress(this.lat, this.lng);
  }

  getAddress(latitude, longitude) {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
      this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            this.zoom = 14;
            var loop = results[0].address_components;
            loop.forEach(element => {
              if (element.types[0] == 'locality') {
                (element.long_name != undefined) ? this.city = element.long_name : this.city = '';
                // // console.log("city1", element.long_name)
              }
              if (element.types[0] == 'postal_code') {
                (element.long_name != undefined) ? this.zip_code = element.long_name : this.zip_code = '';
                // // console.log("zip_code", element.long_name)
              }

            });
            var latitude = CryptoJS.AES.encrypt(String(this.lat), '');
            localStorage.setItem('lat', latitude.toString());

            var longitude = CryptoJS.AES.encrypt(String(this.lng), '');
            localStorage.setItem('lng', longitude.toString());
            (results[0].formatted_address != undefined) ? this.address = results[0].formatted_address : this.address = '';
            (results[0].formatted_phone_number != undefined) ? this.contactNumber = results[0].formatted_phone_number : this.contactNumber = '';
            (results[0].website != undefined) ? this.web_site = results[0].website : this.web_site = '';
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    })
  }

  close() {
    this.dialogRef.close();
  }
  findAddressMap() {
    this.findAdress();
  }
}
