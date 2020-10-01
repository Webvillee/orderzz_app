import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
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
  created_on;
  order_status//(1=Order_Place, 2=Accept,3=Preparing, 4=Delivered ,5-collected(in case of delevery),6=reject_by_rest,7=canceled_by_user )
  orderItems
  orderHistory;
  itemArray = [];
  getItemData =[]
  img_url = UrlSetting.image_uri;
  order_id
  rest_name
  rest_description
  constructor(private router: Router, private route: ActivatedRoute , private mapsAPILoader: MapsAPILoader, private orderService: OrderService) {
    var rest_id = localStorage.getItem('rest_id');

    this.order_id = this.route.snapshot.params.id;

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
    // this.isLoading = true
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        // this.isLoading = false
        console.log(res.data, 'ifff');
        this.rest_name= res.data.rest_name;
        this.rest_description= res.data.rest_description
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
    const obj = {orderId: this.order_id, userId: this.userId, restId: this.restId  }

     this.orderService.postAll('get_my_order_status', obj).subscribe((res) => {
        if (res.status === 200) {
          this.isLoading = false
          console.log(res.data);
          this.orderHistory = res.data
          this.orderItems=res.data.order_items
          if(this.orderItems){
            const data = JSON.parse(this.orderItems)
            this.itemArray = data;
            if(this.itemArray.length===0){
              this.router.navigate(['/order'])
            }
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
      
            // this.orderTotal = total;
            let sellPrice = this.itemArray.reduce((prev, item) => prev + item.sell_price, 0);
            // this.savingCost = sellPrice;
            const seen = new Set();
            const filteredArr = data.filter(el => {
              const duplicate = seen.has(el._id);
              seen.add(el._id);
              return !duplicate;
            });
            this.getItemData = filteredArr
          
          }
          
          setTimeout(function(){ this.displaysuccess='' }, 3000);
        } else {
          this.isLoading = false
          // this.displaysuccess = ''
          // this.display = res.msg;
        }
      });
  }

  countOrder(id) {
    var count = (input, arr) => arr.filter(x => x._id === input).length;
    return count(id, this.itemArray);
  }


}
