import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-order-placed',
  templateUrl: './order-placed.component.html',
  styleUrls: ['./order-placed.component.css']
})
export class OrderPlacedComponent implements OnInit {
  public lat;
  public lng;
  public zoom = 4;
  public origin: any;
  public destination: any;
  address: any = "";
  geoCoder
  isLoading;
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
  rest_name;
  placedData
  trackId: any;
  trackurldrop: any ;
  constructor(private router: Router, private route: ActivatedRoute , private mapsAPILoader: MapsAPILoader, private orderService: OrderService, private spinner: NgxSpinnerService) {
    var rest_id = localStorage.getItem('rest_id');
    localStorage.removeItem("OrderData");
    localStorage.removeItem("order_instruction");
    localStorage.removeItem("mytime");

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

    if (localStorage.getItem('placedData')) {
      this.placedData = CryptoJS.AES.decrypt(localStorage.getItem('placedData'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
    }
    

    this.get_all_rest_data();
    this.myOrderlist()

  }

  ngOnInit(): void {
  }

  get_all_rest_data() {
    // this.isLoading = true
    this.spinner.show();
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        this.spinner.hide();
        // this.isLoading = false
        // console.log(res.data, 'ifff');
        this.rest_name= res.data.rest_name;
        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color

      } else {
        // this.isLoading = false
        this.spinner.hide();
        // // console.log('ellls')
        // this.router.navigate(['/not-found'])
      }
    });
  }

  myOrderlist(){
    // this.isLoading = true
    this.spinner.show();
    const obj = {orderId: this.order_id, userId: this.userId, restId: this.restId  }

     this.orderService.postAll('get_my_order_status', obj).subscribe((res) => {
        if (res.status === 200) {
          this.spinner.hide();
          // this.isLoading = false
          console.log(res.data);
          this.orderHistory = res.data

          if (this.orderHistory.order_type === 1) {
            if (this.orderHistory.order_status >= 3 && this.orderHistory.order_status !== 6 && this.orderHistory.order_status !== 7) {
              this.trackId = this.orderHistory.trackId
              this.trackurldrop =''
              this.track_order()
            }
          }
          this.orderItems=res.data.order_items
          if(this.orderItems){
            const data = JSON.parse(this.orderItems)
            this.itemArray = data;
            if(this.itemArray.length===0){
              this.router.navigate(['/order'])
            }
            let total = this.itemArray.reduce((prev, item) => prev + item.price, 0);
            //  // console.log(JSON.stringify(this.itemArray))
            const arr_total = this.itemArray
      
            this.itemArray.map((element, index) => {
              if (element.is_modifire_status === 1) {
                const availmodifire = JSON.parse(element.available_modifire);
                // // console.log(availmodifire, 'pppppp');
                for (let step = 0; step < availmodifire.length; step++) {
                  // availmodifire[step].modifire.reduce((prev, item) => prev + item.sell_price, 0);
                  availmodifire[step].modifire.map(function (el) {
                    if (el.isChecked === true) {
                      // console.log(el.price, 'elllll');
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
          this.spinner.hide();
          // this.isLoading = false
          // this.displaysuccess = ''
          // this.display = res.msg;
        }
      });
  }

  getorderDatetime(orderdateTime, orderCompleteTime) {
    var d = new Date(orderdateTime);
    var hms = orderCompleteTime;   // your input string
    if(hms !==null){
    var a = hms.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var minutes
    if((a[1]) !=undefined){
      var seconds = (+a[0]) * 60 * 60 + (+((a[1]) ? (a[1]) : 0)) * 60;
       minutes = Math.floor(seconds / 60);
      // console.log("if",seconds)
    }else{
      var seconds = (+a[0]) * 60 ;
      minutes = Math.floor(seconds / 60);
      // console.log("else",seconds)
    }
    // console.log(minutes, 'minutes')
    d.setMinutes(d.getMinutes() + minutes);
    let date1 = Math.floor(new Date(d).getTime()/1000);
    let date2 = Math.floor(new Date().getTime()/1000);
    let time = date1 - date2;  //msec
    return  time ;
  }
  }

  countOrder(id) {
    var count = (input, arr) => arr.filter(x => x._id === input).length;
    return count(id, this.itemArray);
  }

  track_order() {

    fetch("https://api.staging.quiqup.com/oauth/token", {
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      "body": JSON.stringify({
        "grant_type": "client_credentials",
        "client_id": "7d267325aee321c82db3dd3fbbe3fd5949ef22975c8f22b8147bcff4d93ab581",
        "client_secret": "695233d31d995e21d9f4838162dffeba63990648c0001d7a5ecc3f157a81c6e8"
      })
    })
      .then(response => response.json())
      .then(response => {
        // console.log(response, 'response')
        if (response.access_token) {
          // console.log(response, scheduled_date);
          fetch(`https://api.staging.quiqup.com/partner/jobs/${this.trackId}`, {
            "method": "GET",
            "headers": {
              "Authorization": `Bearer ${response.access_token}`,
              "Content-Type": "application/json",
              "accept": "application/json"
            },
          })
            .then(res => res.json())
            .then(async (res) => {
              let trackingUrl = res.orders[0]
              this.trackurldrop = (trackingUrl.dropoff) ? trackingUrl.dropoff.tracking_url :''
              console.log('ljhj', trackingUrl, this.trackurldrop)
              // this.setState({ alltrackDetails: res, trackingUrl: res.orders[0], loadingdrop: false, loadingpick: false, visiblemodal: true, })
            })
            .catch(error => {

            });
        } else {
          // this.notifier.notify("error", response.error + ' please recheck');
        }

      })
      .catch(err => {
        // this.notifier.notify("error", err);
      });
  }

}

