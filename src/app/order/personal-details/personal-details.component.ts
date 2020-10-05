import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { NgxSpinnerService } from "ngx-spinner";


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
    if (localStorage.getItem('UserData')) {
    const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
    // this.UserData= data
    // console.log(data, 'lll')
      this.userName= data.user_name
      this.email= data.user_email
    }
   
    this.angForm = this.fb.group({
      userName: ['', Validators.required, Validators.minLength(3)],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
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



  onSubmit() {
    // console.log(this.angForm.controls.userName.value, '776767888');
    var userName = this.angForm.controls.userName.value;
    var userEmail = this.angForm.controls.email.value;
    const obj = { userId: this.userId, userName: userName, userEmail: userEmail  }
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
          this.router.navigate(['/confirm-address']);
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
      this.submitted = false;
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
