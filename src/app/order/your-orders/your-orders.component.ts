import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js'
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'

@Component({
  selector: 'app-your-orders',
  templateUrl: './your-orders.component.html',
  styleUrls: ['./your-orders.component.css']
})
export class YourOrdersComponent implements OnInit {

  public lat;
  public lng;
  public zoom = 4;
  public origin: any;
  public destination: any;
  address: any = "";
  geoCoder
  isLoading = false;
  userId
  restId
  order_number
  total_amount
  created_on;
  order_status//(1=Order_Place, 2=Accept,3=Preparing, 4=Delivered ,5-collected(in case of delevery),6=reject_by_rest,7=canceled_by_user )
  orderItems
  orderHistory = [];
  img_url = UrlSetting.image_uri
  constructor(private router: Router, private mapsAPILoader: MapsAPILoader, private orderService: OrderService) {
    var rest_id = localStorage.getItem('rest_id');

    if (rest_id == null) {
      this.router.navigate(['/not-found'])
    }
    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
    }
    if(localStorage.getItem('rest_id')){
     this.restId = CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    }

    this.get_all_rest_data();
    this.myOrderlist()

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
        // this.isLoading = false
        // console.log(res.data, 'ifff')
        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color

      } else {
        // this.isLoading = false
        // console.log('ellls')
        // this.router.navigate(['/not-found'])
      }
    });
  }

  myOrderlist(){
    this.isLoading = true
    const obj = {userId: this.userId, restId: this.restId  }

     this.orderService.postAll('my_order_list', obj).subscribe((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.orderHistory = res.data;
          this.isLoading = false
          // this.order_number= res.data.order_number
          // this.total_amount=res.data.total_amount
          // this.created_on=res.data.created_on
          // this.order_status=res.data.order_status
          // this.orderItems=res.data.order_items
          // var userOrder = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();
          // localStorage.setItem('UserData', userOrder);
          // var encrypted_order_type = CryptoJS.AES.encrypt(userName, '');
          // localStorage.setItem('userName',encrypted_order_type.toString());
          // this.router.navigate(['/confirm-address']);
          // this.display = ''
          // this.displaysuccess = "Succussfully";
          
          setTimeout(function(){ this.displaysuccess='' }, 3000);
        } else {
          this.isLoading = false
          // this.displaysuccess = ''
          // this.display = res.msg;
        }
      });
  }

  orderDetails(OrderDetails, heading){
    const alData = JSON.parse(OrderDetails);
    console.log(alData, 'OrderDetails', heading);
    if(heading ==='title'){
      return alData[0].item_name;
    }else if(heading ==='image'){
      return alData[0].item_image;
    }else{
      return alData.length;
    }
  }


}