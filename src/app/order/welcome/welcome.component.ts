import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  getRestData;
  facebookId;
  instaId;
  linkeinId;
  logo;
  restName;
  themeView;
  themeTechniq;
  themeColor;
  restAddress;
  restEmail;
  restDescription;
  restContact;
  restContactAlter;
  minimumOrderValue;
  maximumOrderValueForFreeDelevery;
  deleveryFee;
  img_url=UrlSetting.image_uri;
  isLoading;
  constructor( private route: ActivatedRoute, private router: Router,private orderService: OrderService ) { 
    
    const slugId = this.route.snapshot.paramMap.get('id');
    this.isLoading =true
    const obj = {
      slugId:slugId,
    };

    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        // console.log(res.data, 'jkhjk');
        this.logo = res.data.rest_logo
        this.instaId = res.data.rest_instagram_id
        this.linkeinId = res.data.rest_linkedin_id
        this.facebookId = res.data.rest_facebook_id
        this.restName = res.data.rest_name
        this.restDescription = res.data.rest_description
        
        var rest_id = res.data._id
        var encrypted_restid = CryptoJS.AES.encrypt(rest_id, '');
        localStorage.setItem('rest_id',encrypted_restid.toString());
        var theme_color = res.data.theme_color;
        document.documentElement.style.setProperty('--primary-color', theme_color);
        this.isLoading =false
        // // for decrypted the encripted code
        // //var decrypted =  CryptoJS.AES.decrypt(encrypted_token,'');
        // // console.log(decrypted.toString(CryptoJS.enc.Utf8))
      } else {
        this.isLoading =false
        this.router.navigate(['/not-found'])
        this.getRestData = [];
      }
    });

  }

  ngOnInit(): void {

  }

}
