import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
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
  itemArray=[]
  orderTotal;
  savingCost
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
      
    const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
    this.UserData=data
    // console.log(data, 'lll')
      this.userName= data.user_name
      this.email= data.user_email
    }

    this.angForm = this.fb.group({
      paymentMethod: ['', Validators.required],
    });

    

    this.get_all_rest_data();
    this.getAllorderData();
  }

  get f() { return this.angForm.controls; }

  get_all_rest_data() {
    this.isLoading =true
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    console.log(obj)
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
        this.router.navigate(['/not-found'])
      }
    });
  }

  getAllorderData() {
    if (localStorage.getItem("OrderData")) {
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      this.itemArray = data;
      let total = this.itemArray.reduce((prev, item) => prev + item.price, 0);
      //  console.log(JSON.stringify(this.itemArray))
      const arr_total = this.itemArray
      this.itemArray.map((element, index) => {
        if (element.is_modifire_status === 1) {
          const availmodifire = JSON.parse(element.available_modifire);
          // console.log(availmodifire, 'pppppp');
          for (let step = 0; step < availmodifire.length; step++) {
            // availmodifire[step].modifire.reduce((prev, item) => prev + item.sell_price, 0);
            availmodifire[step].modifire.map(function (el) {
              if (el.isChecked === true) {
                console.log(el.price, 'elllll');
                total =  total + el.price
              }
            })
          }
        }
      });

      this.orderTotal = total;
      
      let sellPrice = this.itemArray.reduce((prev, item) => prev + item.sell_price, 0);
      this.savingCost = sellPrice;
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



  onSubmit() {
    
    var paymentMethod = this.angForm.controls.paymentMethod.value;
    // var userEmail = this.angForm.controls.email.value;
    // console.log('7767678888888888888', paymentMethod, this.angForm.invalid);

   

    this.submitted = true;

    // stop here if form is invalid
    if (this.angForm.invalid) {
      return;
    }
    
    let orderType;
    let order_instruction='';
    let items;
    let res_id;
    if(localStorage.getItem('order_type')){
       orderType = CryptoJS.AES.decrypt(localStorage.getItem('order_type'), '').toString(CryptoJS.enc.Utf8);
    }

    if(localStorage.getItem('order_instruction')){
       order_instruction =CryptoJS.AES.decrypt(localStorage.getItem('order_instruction'), '').toString(CryptoJS.enc.Utf8)
    }

    if(this.itemArray){
       items = JSON.stringify(this.itemArray)
    }

    if(localStorage.getItem('rest_id')){
      res_id= CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    }

    if(paymentMethod){
      this.submitted = true;
      const obj = { restId: res_id, userId: this.userId, orderType:  Number(orderType), orderItems: items, orderDescription:order_instruction, totalAmount: this.orderTotal, paymentMethod: Number(paymentMethod)  , orderReview: 1, isCreditPayment: 1 }
      // console.log(paymentMethod, '776767888', obj);
  
      this.orderService.postAll('place_order', obj).subscribe((res) => {
        if (res.status === 200) {
          var encrypted_order_type = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();;
          localStorage.setItem('placedData',encrypted_order_type.toString());
      
          localStorage.removeItem("OrderData")
          this.display = ''
          this.displaysuccess = "Succussfully";
          this.router.navigate(['/order-placed']);
          setTimeout(function(){ this.displaysuccess='' }, 3000);
        } else {
          this.displaysuccess = ''
          this.display = res.msg;
        }
      });
    }else{
      this.submitted = false;
    }
  }

  onReset() {
    this.submitted = false;
    this.angForm.reset();
  }

  ngOnInit(): void {
  }

}
