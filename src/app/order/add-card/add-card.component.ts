import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddressPopupComponent } from '../address-popup/address-popup.component'
import { SuccessDialogComponent, SuccessDialogModel } from '../../shared/dialogs/success-dialog/success-dialog.component';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.css']
})
export class AddCardComponent implements OnInit {
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
  card_number;
  expiry;
  isLoading =false
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService) {

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
    // // console.log(data, 'lll')
      this.card_number= data.user_name
      this.expiry= data.user_expiry
    }
   
    this.angForm = this.fb.group({
      card_number: ['', Validators.required, Validators.minLength(12)],
      expiry: ['', Validators.required],
      // cvv: ['', Validators.required, Validators.minLength(3)],
    });

    

    this.get_all_rest_data();
  }

  get f() { return this.angForm.controls; }

  get_all_rest_data() {
    this.isLoading =true
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        this.isLoading =false
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
        this.isLoading =false
        this.router.navigate(['/not-found'])
      }
    });
  }



  onSubmit() {
    // // console.log(this.angForm.controls.card_number.value, '776767888');
    var card_number = this.angForm.controls.card_number.value;
    var cardexpiry = this.angForm.controls.expiry.value;
    // var cvv = this.angForm.controls.cvv.value;
    const obj = { userId: this.userId, cardNumber: card_number, cardExpiry: cardexpiry }
    
    this.submitted = true;

    // stop here if form is invalid
    if (this.angForm.invalid) {
      return;
    }
    if (this.submitted === true && (card_number || '').trim().length != 0 && card_number.length >= 12 && (cardexpiry || '').trim().length != 0) {
      // // console.log(obj, '787678', card_number.length);

      this.orderService.postAll('add_card_data', obj).subscribe((res) => {
        if (res.status === 200) {
          var userOrder = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();
          localStorage.setItem('UserData', userOrder);
          var encrypted_order_type = CryptoJS.AES.encrypt(card_number, '');
          localStorage.setItem('card_number',encrypted_order_type.toString());
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
      // // console.log(this.angForm.controls.card_number, '00000000', card_number.length);
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

  checkMonth(e) {
    if (e.target.value > 12) {
      e.target.value = "";
      // // console.log(e.target.value)
    }
    // // console.log(e.target.value.length, 'length')
   
  }

}

