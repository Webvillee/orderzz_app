import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { NgxSpinnerService } from "ngx-spinner";
import { SocketioService } from '.././socketio.service'
@Component({
  selector: 'app-signin-otp',
  templateUrl: './signin-otp.component.html',
  styleUrls: ['./signin-otp.component.css']
})
export class SigninOtpComponent implements OnInit {

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
  isLoading;
  timeLeft: number = 60;
  interval;
  affiliateId
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService, private spinner: NgxSpinnerService, private socketService: SocketioService) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }
    this.startTimer()
    this.angForm = this.fb.group({
      otp: ['', Validators.required, Validators.minLength(4)],
    });

    if (localStorage.getItem('UserData')) {
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
      // this.UserData= data
      // console.log(data, 'lll')
      this.userId = data._id;
    }
    if(localStorage.getItem('affiliateId')){
      this.affiliateId =CryptoJS.AES.decrypt(localStorage.getItem('affiliateId'), '').toString(CryptoJS.enc.Utf8)
    }





    this.get_all_rest_data();
  }

  get f() { return this.angForm.controls; }

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



  onSubmit() {
    // console.log(this.angForm.controls.otp.value, '776767888');
    const restId= CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    var otp = this.angForm.controls.otp.value;

    const obj = { userId: this.userId, otp: otp ,restId:restId}

    // // stop here if form is invalid

    this.submitted = true;
    if (this.submitted === true && (otp || '').trim().length != 0 && otp.length >= 4) {
      // console.log(this.angForm.controls.otp, '787678', otp.length);
      this.orderService.postAll('verify_otp', obj).subscribe((res) => {
        this.spinner.show();
        if (res.status === 200) {
          this.spinner.hide();
          if (localStorage.getItem('UserData')) {
            const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
            // this.UserData= data
            // console.log(data, 'lll');
            var encrypted_order_type = CryptoJS.AES.encrypt(data._id, '');
            localStorage.setItem('userId', encrypted_order_type.toString());
            localStorage.setItem('usersid', data._id);
            localStorage.removeItem('affiliateId');
            this.socketService.getMessages().subscribe((message) => {
            console.log(message)
            });
  
          }
          this.display = ''
          this.displaysuccess = "Succussfully";
          this.router.navigate(['/order']);
          setTimeout(function () { this.displaysuccess = '' }, 3000);
        } else {
          this.spinner.hide();
          this.displaysuccess = ''
          this.display = res.msg;
        }
      });

    } else {
      // console.log(this.angForm.controls.otp, '00000000', otp.length);
      if (this.angForm.invalid) {
        return false;
      }
    }


  }

  resendotp() {
    // console.log(this.userId, 'userId');
    const restId= CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    const obj = { userId: this.userId ,restId:restId}
    if (this.userId) {
      this.orderService.postAll('resend_otp', obj).subscribe((res) => {
        if (res.status === 200) {
          this.display = ''
          this.displaysuccess = "OTP resend Succussfully";
          setTimeout(function () { this.displaysuccess = '' }, 3000);
        } else {
          this.displaysuccess = ''
          this.display = res.msg;
        }
      });
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

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
    }, 1000)
  }

}
