import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { from, Observable } from 'rxjs';
import { OrderService } from './order.service';
import { UrlSetting } from '../urlSetting'
import * as CryptoJS from 'crypto-js'
import { SocketioService } from './socketio.service'
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

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
  restId

  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService, private socketService: SocketioService) {
    // if( localStorage.getItem('rest_id')==null ){
    //   this.router.navigate(['/not-found'])
    // }

    // if(localStorage.getItem('customer_address')==null){
    //   this.customer_address=""
    // }else{
    //   this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'),'').toString(CryptoJS.enc.Utf8);
    // }
    // this.socketService.setupSocketConnection()
    this.get_all_rest_data();
  }

  ngOnInit() {
    // this.socketService.setupSocketConnection()
    this.socketService.getMessages().subscribe((message) => {
      // console.log(message)
      // this.totalNotification = (message.data.length != undefined) ? message.data.length : 0
      // this.orderData = message.data.orderData
      // localStorage.setItem('totalNotificationata',this.totalNotification);
      // this.playAudio();
     });
  }

  ngDoCheck() {
  }

  // ngAfterContentChecked() {
  //   this.socketService
  //     .orderPlace()
  //     .subscribe((message: string) => {
  //       // console.log(message)
  //     });
  // }

  get_all_rest_data() {
    if (localStorage.getItem('rest_id')) {
      const obj = {
        restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
      };
      this.orderService.get_restaurant_data(obj).subscribe((res) => {
        if (res.status == 200) {
          // // console.log(res.data)
          // this.themeView = res.data.theme_view
          // if(this.themeView=="1"){       //1=listview in  and 2= gridmeans
          //   this.themeCondition=false
          // }else{
          //   this.themeCondition=true
          // }
          var theme_color = res.data.theme_color;
          document.documentElement.style.setProperty('--primary-color', theme_color);
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
  }

}