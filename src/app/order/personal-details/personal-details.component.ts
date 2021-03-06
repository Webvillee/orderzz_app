import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { NgxSpinnerService } from "ngx-spinner";
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {
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

  getCategoryData: any;
  catId
  menuId
  restId;
  orderCount;
  submitted = false;
  userId;
  UserData;
  userName;
  email;
  isLoading;
  fileToUpload: File = null;
  previewUrl: any = null;
  fileUploadProgress: any
  public myMediaGallery: any
  user_image
  selectedDeliveryType
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService, private spinner: NgxSpinnerService) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }

    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
    }
    if (localStorage.getItem('order_type')) {
      const orderType = CryptoJS.AES.decrypt(localStorage.getItem('order_type'), '').toString(CryptoJS.enc.Utf8)
      this.selectedDeliveryType = orderType
    }
    if (localStorage.getItem('UserData')) {
    const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
    // this.UserData= data
    // console.log(data, 'lll')
      this.user_image = data.user_image_url
      this.userName= data.user_name
      this.email= data.user_email
    }
   
    this.angForm = this.fb.group({
      userName: ['', Validators.required, Validators.minLength(3)],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      file: ['']
    });

    

    this.get_all_rest_data();
  }

  get f() { return this.angForm.controls; }

  ngAfterContentChecked() {
    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      
    // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
    // this.UserData=data
    // console.log(data, 'lll')
    //   this.userName= data.user_name
    //   this.email= data.user_email
    }

  }

  get_all_rest_data() {
    // this.isLoading =true
    this.spinner.show();
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        // this.isLoading =false
        this.spinner.hide();
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
        // this.isLoading =false
        this.spinner.hide();
        this.router.navigate(['/not-found'])
      }
    });
  }

  onFileSelected(event) {
    this.fileToUpload = event.target.files.item(0)
// console.log(this.fileToUpload.type,'ggggthis.fileToUpload.type')
    if (this.fileToUpload.type == 'image/jpeg' || this.fileToUpload.type == 'image/png' || this.fileToUpload.type == 'image/gif' || this.fileToUpload.type == 'image/apng' || this.fileToUpload.type == 'image/svg+xml') {

      if (event.target.files && event.target.files[0]) {
        let reader = new FileReader();


        reader.readAsDataURL(event.target.files[0]); // read file as data url

        reader.onload = (event) => { // called once readAsDataURL is completed  

          // this.uploadingFile.push(event.target.result);
          // this.uploadingFile.push({type: 'image', url: event.target.result});
        }
      }
      this.fileUploadProgress = '0%';
      // this.myMediaGallery = "document/1590582983195.png";
      this.orderService.uploadFile(event.target.files[0]).subscribe(events => {

        if (events.type === HttpEventType.UploadProgress) {
          this.fileUploadProgress = Math.round(events.loaded / events.total * 100) + '%';
        } else if (events.type === HttpEventType.Response) {
          this.fileUploadProgress = '';
          this.myMediaGallery = events.body.data.filepath;
          this.user_image= events.body.data.filepath;
          // alert('SUCCESS !!');
        }
        // console.log(this.myMediaGallery);
      }, error => {
        console.log(error);
      });
    } else {
      alert("Please Upload an image (JPEG, PNG, GIF)")
    }
  }

  onSubmit() {
    // console.log(this.angForm.controls.userName.value, '776767888');
    var userName = this.angForm.controls.userName.value;
    var userEmail = this.angForm.controls.email.value;
    const obj = { userId: this.userId, userName: userName, userEmail: userEmail , userImageUrl: this.user_image }
    // var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var mailformat = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
    // // stop here if form is invalid
    
    this.submitted = true;

    // stop here if form is invalid
    if (this.angForm.invalid) {
      return;
    }
    if (this.submitted === true && (userName || '').trim().length != 0 && userName.length >= 2 && userEmail.match(mailformat)) {
      // console.log(this.angForm.controls.userName, '787678', userName.length);

      this.orderService.postAll('update_profile', obj).subscribe((res) => {
        if (res.status === 200) {
          var userOrder = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();
          localStorage.setItem('UserData', userOrder);
          var encrypted_order_type = CryptoJS.AES.encrypt(userName, '');
          localStorage.setItem('userName',encrypted_order_type.toString());
          if(this.selectedDeliveryType ==='2'){
            this.router.navigate(['/pickup-location']);
          }else{
            this.router.navigate(['/confirm-address']);
          }
          
          this.display = ''
          this.displaysuccess = "Succussfully";
          
          setTimeout(function(){ this.displaysuccess='' }, 3000);
        } else {
          this.displaysuccess = ''
          this.display = res.msg;
        }
      });

    } else {
      // console.log(this.angForm.controls.userName, '00000000', userName.length);
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

  ngOnInit(): void {
  }

}
