import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { NgxSpinnerService } from "ngx-spinner";
import { SocketioService } from '../socketio.service'
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  angForm: FormGroup;
  display: String;
  displaysuccess: String;
  displayError: String;
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
  itemArray = []
  orderTotal;
  savingCost
  isLoading;
  themeData: any;
  latitude
  longitude
  address
  landmark;
  card_details;
  cardCvv
  promocode
  promosubmit = false;
  isPromoCodeApply = 2;
  totalorderPrice
  userDevicetype: Number
  orderType: Number
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService, private spinner: NgxSpinnerService, private socketService: SocketioService) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }
    if (localStorage.getItem('order_type')) {
      this.orderType = Number(CryptoJS.AES.decrypt(localStorage.getItem('order_type'), '').toString(CryptoJS.enc.Utf8));
    }
    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))  
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
      this.UserData = data
      // console.log(data, 'lll');
      this.userName = data.user_name
      this.email = data.user_email
      this.latitude = data.lat
      this.longitude = data.lng
      this.address = data.address
      this.landmark = data.landmark
    }

    

    this.angForm = this.fb.group({
      paymentMethod: ['', Validators.required],
    });

    this.get_all_rest_data();
    this.getAllorderData();
    this.getCardDetails();
    this.getDeviceType();
  }

  get f() { return this.angForm.controls; }

  get_all_rest_data() {
    // this.isLoading =true
    this.spinner.show();
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    console.log(obj)
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        this.spinner.hide();
        // this.isLoading =false
        this.themeData = res.data;
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
        // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
        if (!localStorage.getItem("OrderData")) {
          this.router.navigate(['/order'])
        }
      } else {
        this.router.navigate(['/not-found'])
      }
    });
  }


  getCardDetails() {
    const obj = {
      userId: this.userId
    };
    console.log(obj)
    this.orderService.postAll('get_card_data', obj).subscribe((res) => {
      if (res.status == 200) {
        console.log(res.data);
        this.card_details = res.data[0]
      } else {
      }
    });
  }

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      // console.log("tablet");
      this.userDevicetype = 4
    }
    if (
      /Mobile|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      // console.log("mobile");
      this.userDevicetype = 4
    }

    if (
      /Mobile|Android|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      // console.log("android");
      this.userDevicetype = 2
    }
    if (
      /Mobile|iP(hone|od|ad)|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      // console.log("iPhone");
      this.userDevicetype = 1
    }
    // console.log("desktop");
    this.userDevicetype = 3
  };

  changeNumber(str) {
    return str.replace(/.(?=\d{4})/g, "*")
  }

  getAllorderData() {
    if (localStorage.getItem("OrderData")) {
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      this.itemArray = data;
      let total = 0
      let savings = 0
      //  console.log(JSON.stringify(this.itemArray))
      const arr_total = this.itemArray

      this.itemArray.map((element, index) => {
        console.log(element)
        if (element.sell_price === 0) {
          total = total + element.price
        } else {
          total = total + element.sell_price;
          savings = element.price - element.sell_price
        }
        if (element.is_modifire_status === 1) {
          const availmodifire = JSON.parse(element.available_modifire);
          // console.log(availmodifire, 'pppppp');
          for (let step = 0; step < availmodifire.length; step++) {
            // availmodifire[step].modifire.reduce((prev, item) => prev + item.sell_price, 0);
            availmodifire[step].modifire.map(function (el) {
              if (el.isChecked === true) {
                // console.log(el.price, 'elllll');
                total = total + el.price
              }
            })
          }
        }
      });

      this.orderTotal = total;
      this.totalorderPrice = total
      this.savingCost = savings;
      const seen = new Set();
      const filteredArr = data.filter(el => {
        const duplicate = seen.has(el._id);
        seen.add(el._id);
        return !duplicate;
      });
      // this.getItemData = filteredArr
      // console.log(this.getItemData, "OrderData")
    }
  }

  ngOnInit() {
    // this.socketService.orderPlace().subscribe((message) => {
    //     console.log(message)
    //   });
  }


  onSubmit() {
    var is_submit = true
    var paymentMethod = this.angForm.controls.paymentMethod.value;
    // var userEmail = this.angForm.controls.email.value;
    // console.log('7767678888888888888', paymentMethod, this.angForm.invalid);
    // console.log(this.cardCvv)
    this.submitted = true;
    if (paymentMethod == 1) {
      if (this.cardCvv === '' || this.cardCvv.trim() === '') {
        is_submit = false
        this.submitted = false;
      }
    }

    // stop here if form is invalid
    if (this.angForm.invalid) {
      return;
    }
    // this.isLoading =true
    this.spinner.show();
    let order_instruction = '';
    let items;
    let res_id;
   

    if (localStorage.getItem('order_instruction')) {
      order_instruction = CryptoJS.AES.decrypt(localStorage.getItem('order_instruction'), '').toString(CryptoJS.enc.Utf8)
    }

    if (this.itemArray) {
      items = JSON.stringify(this.itemArray)
    }

    if (localStorage.getItem('rest_id')) {
      res_id = CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    }
    let pickupAddress;
    if(this.orderType===2){
      if (localStorage.getItem('pickupAddress')) {
        pickupAddress = CryptoJS.AES.decrypt(localStorage.getItem('pickupAddress'), '').toString(CryptoJS.enc.Utf8);
        console.log(pickupAddress,'this.pickupAddress')
      }else{
        pickupAddress= ''
      }
    }else{
      if (localStorage.getItem('pickupAddress')) {
        pickupAddress = CryptoJS.AES.decrypt(localStorage.getItem('pickupAddress'), '').toString(CryptoJS.enc.Utf8);
        console.log(pickupAddress,'this.pickupAddress')
      }else{
        pickupAddress= ''
      }
    }

    

    if (paymentMethod && this.submitted === true) {
      const obj = { restId: res_id, userId: this.userId, orderType: this.orderType, orderItems: items, orderDescription: order_instruction, totalAmount: this.orderTotal, paymentMethod: Number(paymentMethod), orderReview: 1, isCreditPayment: 1, deleveryAddress: this.address, deleveryLandmark: this.landmark, deleveryLat: Number(this.latitude), deleveryLng: Number(this.longitude), pickupAddress: pickupAddress, pickupLat: '', pickupLng: '', totalItemCount: this.itemArray.length, isPromoCodeApply: this.isPromoCodeApply, promoCode: this.promocode, user_device_type: this.userDevicetype }
      // console.log(paymentMethod, '776767888', obj);
      this.socketService.getMessages().subscribe((message) => {
        console.log(message)
      })
      this.orderService.postAll('place_order', obj).subscribe((res) => {
        if (res.status === 200) {
          this.socketService.orderPlace(res.data);
          var encrypted_order_type = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();;
          localStorage.setItem('placedData', encrypted_order_type.toString());

          localStorage.removeItem("OrderData")
          this.display = ''
          this.displaysuccess = "Succussfully";
          this.router.navigate([`/order-tracking/${res.data._id}`]);
          setTimeout(function () { this.displaysuccess = '' }, 3000);
          // this.isLoading =false
          this.spinner.hide();
        } else {
          // this.isLoading =false
          this.spinner.hide();
          this.displaysuccess = ''
          this.display = res.msg;
        }
      });
    } else {
      this.submitted = false;
      // this.isLoading =false
      this.spinner.hide();

    }
    // this.isLoading =false
    this.spinner.hide();

  }

  onReset() {
    this.submitted = false;
    this.angForm.reset();
  }

  onKeypressEvent(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  applyCode() {
    let res_id;
    let totalordervalue = this.totalorderPrice
    if (localStorage.getItem('rest_id')) {
      res_id = CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    }
    const obj = { restId: res_id, userId: this.userId, couponCode: this.promocode.trim() }
    // console.log(paymentMethod, '776767888', obj);
    if (this.promocode && (this.promocode || '').trim().length != 0) {
      this.promosubmit = false;
      this.spinner.show();
      this.orderService.postAll('apply_promo_code', obj).subscribe((res) => {
        if (res.status === 200) {
          if (res.data.is_minimum_price_type === 1) {
            if (totalordervalue >= res.data.minimum_price_value) {
              if (res.data.discount_type === 1) {
                let promoAmount = totalordervalue * res.data.discount_type_value / 100
                totalordervalue = totalordervalue - promoAmount
                this.isPromoCodeApply = 1
                this.displaysuccess = res.msg;
                this.displayError = ''
              } else if (res.data.discount_type === 2) {
                if (totalordervalue <= res.data.discount_type_value) {
                  this.displayError = `add more items for this coupon`;
                  this.displaysuccess = ''
                } else {
                  totalordervalue = totalordervalue - res.data.discount_type_value
                  this.isPromoCodeApply = 1
                  this.displaysuccess = res.msg;
                  this.displayError = ''
                }
              }
            }
          } else {
            if (res.data.discount_type === 1) {
              let promoAmount = totalordervalue * res.data.discount_type_value / 100
              totalordervalue = totalordervalue - promoAmount
              this.isPromoCodeApply = 1
              this.displaysuccess = res.msg;
              this.displayError = ''
            } else if (res.data.discount_type === 2) {
              if (totalordervalue <= res.data.discount_type_value) {
                this.displayError = `add more items for this coupon`;
                this.displaysuccess = ''
              } else {
                this.isPromoCodeApply = 1
                totalordervalue = totalordervalue - res.data.discount_type_value;
                this.displaysuccess = res.msg;
                this.displayError = ''
              }
            }
          }
          this.orderTotal = totalordervalue
          this.display = ''
          setTimeout(function () { this.displaysuccess = '' }, 3000);
          setTimeout(function () { this.displayError = '' }, 3000);
          // this.isLoading =false
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.displaysuccess = ''
          this.displayError = res.msg;
        }
        this.spinner.hide();
      });
    } else {
      this.promosubmit = true
    }


  }


}
