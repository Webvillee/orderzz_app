import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  angForm: FormGroup;
  display: string;
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
  isRequired = false
  submitted = false;
  isLoading;
  affiliateId
  mobilenoCode: any =971;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService, private spinner: NgxSpinnerService) {

    const slugId = this.route.snapshot.params.id
    this.affiliateId = this.route.snapshot.params.affiliateid;
    // console.log(this.affiliateId, slugId);
    localStorage.removeItem('affiliateId');
    if(slugId){
      var encrypted_restid = CryptoJS.AES.encrypt(slugId, '');
      localStorage.setItem('rest_id',encrypted_restid.toString());
      var encrypted_affiliateId = CryptoJS.AES.encrypt(this.affiliateId, '');
      localStorage.setItem('affiliateId',encrypted_affiliateId.toString());
      this.isLoading =true
      const obj = {
        slugId:slugId,
      };
      this.spinner.show();
      this.orderService.get_restaurant_data(obj).subscribe((res) => {
        if (res.status == 200) {
          this.logo = res.data.rest_logo
          this.restName = res.data.rest_name
          
          var rest_id = res.data._id
          var encrypted_restid = CryptoJS.AES.encrypt(rest_id, '');
          localStorage.setItem('rest_id',encrypted_restid.toString());
          
          var theme_color = res.data.theme_color;
          document.documentElement.style.setProperty('--primary-color', theme_color);
          // this.spinner.hide();
          this.spinner.hide();
        } else {
          // this.isLoading =false
          this.spinner.hide();
          this.router.navigate(['/not-found'])
        }
      });
    }else{
      // console.log("hhghgghjhhj", 'jkhjk');
      if (localStorage.getItem('rest_id') == null) {
        this.router.navigate(['/not-found'])
      }
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }

    this.angForm = this.fb.group({
      mobileno: ['', Validators.required, Validators.minLength(8)],
      mobilenoCode: ['', Validators.required, Validators.minLength(3)]
    })

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

      }
    });
  }


  onSubmit() {
    // // console.log( this.angForm.controls.mobileno.value, 'ioiioiopioiopiop');  
    this.submitted = true;
    var mobileno =this.angForm.controls.mobilenoCode.value + this.angForm.controls.mobileno.value;
    const restId= CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    const obj = { phoneNo: mobileno ,restId: restId }
    // // stop here if form is invalid
    
    if (this.submitted === true && (mobileno || '').trim().length != 0 && mobileno.length > 9) {
      console.log(this.angForm.controls.mobileno, '787678', mobileno.length);
      if(this.affiliateId){
        this.orderService.postAll('affilate_sign_in', obj).subscribe((res) => {
          if (res.status === 200) {
            // all user details
            var userOrder = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();
            localStorage.setItem('UserData', userOrder);
  
            this.router.navigate(['/signin-otp']);
            this.display = ''
            this.displaysuccess = res.msg
          } else {
            this.displaysuccess = ''
            this.display = res.msg;
          }
        });
      }else{
        this.orderService.postAll('sign_in', obj).subscribe((res) => {
          if (res.status === 200) {
            // all user details
            var userOrder = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();
            localStorage.setItem('UserData', userOrder);
  
            this.router.navigate(['/signin-otp']);
            this.display = ''
            this.displaysuccess = res.msg
          } else {
            this.displaysuccess = ''
            this.display = res.msg;
          }
        });
      }
      
    }else{
      // // console.log(this.angForm.controls.mobileno, '00000000', mobileno.length);
      if (this.angForm.invalid) {
        return false;
    }
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

