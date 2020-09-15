import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'

@Component({
  selector: 'app-view-basket',
  templateUrl: './view-basket.component.html',
  styleUrls: ['./view-basket.component.css']
})
export class ViewBasketComponent implements OnInit {
  themeCondition
  themeView
  customer_address
  banner
  logo
  restName
  restAddress
  minimumOrderValue
  img_url = UrlSetting.image_uri

  catId
  menuId
  restId;
  orderCount;
  itemArray=[];
  getItemData;

  orderTotal;
  savingCost;
  shippingCost;
  constructor( private route: ActivatedRoute, private router: Router,private orderService: OrderService ) { 
  
    if( localStorage.getItem('rest_id')==null ){
      this.router.navigate(['/not-found'])
    }

    if(localStorage.getItem('customer_address')==null){
      this.customer_address=""
    }else{
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'),'').toString(CryptoJS.enc.Utf8);
    }

    this.get_all_rest_data();
    this.getAllorderData();
  }

  get_all_rest_data(){
      const obj = {
        restId:CryptoJS.AES.decrypt(localStorage.getItem('rest_id'),'').toString(CryptoJS.enc.Utf8)
      };
      this.orderService.get_restaurant_data(obj).subscribe((res) => {
        if (res.status == 200) {

          this.themeView = res.data.theme_view
          if(this.themeView=="1"){       //1=listview in  and 2= gridmeans
            this.themeCondition=false
          }else{
            this.themeCondition=true
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

  getAllorderData(){
    if (localStorage.getItem("OrderData")) {
     const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
     this.itemArray = data;
     let total = this.itemArray.reduce((prev, item) => prev + item.price, 0);
     this.orderTotal= total;
     let sellPrice = this.itemArray.reduce((prev, item) => prev + item.sell_price, 0);
     this.savingCost= sellPrice;
     const seen = new Set();
     const filteredArr = data.filter(el => {
      const duplicate = seen.has(el._id);
      seen.add(el._id);
      return !duplicate;
    });
      this.getItemData = filteredArr
      console.log(this.getItemData, "OrderData")
    }
  }

  addToCart(itemData){
    // console.log(itemData, 'itemDatakkkkk');
    this.itemArray.push(itemData);
    console.log(this.itemArray);
    var userOrderData = CryptoJS.AES.encrypt(JSON.stringify(this.itemArray), '').toString();
    localStorage.setItem('OrderData', userOrderData);
    this.getAllorderData();
  }

  countOrder(id){
    var count = (input, arr) => arr.filter(x => x._id === input).length;
    // console.log (count(id, this.itemArray));
    return count(id, this.itemArray);
  }

  removeToCart(value){
      var index = this.itemArray.findIndex(x => x._id === value);
      if (index > -1) {
        this.itemArray.splice(index, 1);
      }
      var userOrderData = CryptoJS.AES.encrypt(JSON.stringify(this.itemArray), '').toString();
      localStorage.setItem('OrderData', userOrderData);
      this.getAllorderData();
      return this.itemArray;
  }
  
  ngOnInit(): void {
  }

}
