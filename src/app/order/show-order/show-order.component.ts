import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'

@Component({
  selector: 'app-show-order',
  templateUrl: './show-order.component.html',
  styleUrls: ['./show-order.component.css']
})
export class ShowOrderComponent implements OnInit {

  themeCondition
  themeView
  customer_address
  banner
  logo
  restName
  restAddress
  minimumOrderValue
  img_url = UrlSetting.image_uri

  constructor( private route: ActivatedRoute, private router: Router,private orderService: OrderService ) { 
  
    if( localStorage.getItem('rest_id')==null ){
      this.router.navigate(['/not-found'])
    }

    if(localStorage.getItem('customer_address')==null){
      this.customer_address=""
    }else{
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'),'').toString(CryptoJS.enc.Utf8);
    }

    this.get_all_rest_data()
    
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

          console.log(this.banner)
          console.log(this.logo)
          console.log(this.restName)
          console.log(this.restAddress)
          console.log(this.minimumOrderValue)

          // this.minimum_order_value = res.data.end_delevery_time
          // this.themeColor = res.data.theme_color
          
        } else {
          this.router.navigate(['/not-found'])
        }
      });
    
  }
  

  ngOnInit(): void {
  }

}
