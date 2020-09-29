import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddressPopupComponent } from '../address-popup/address-popup.component'

@Component({
  selector: 'app-show-order',
  templateUrl: './show-order.component.html',
  styleUrls: ['./show-order.component.css'],
})
export class ShowOrderComponent implements OnInit {
  public selectedDeliveryType = "2";
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
  itemArray = [];
  getItemData
  catName
  clicked
  private toggle : boolean = false;
  isLoading =false
  userId
  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService, public dialog: MatDialog) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
    }

    this.get_all_rest_data()
    this.get_all_category()
  }

  ngOnInit(): void {
  }


  ngAfterContentChecked() {
    if (localStorage.getItem('customer_address')) {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    } else {
      this.customer_address = ""
    }
  }

  get_all_rest_data() {
    this.isLoading =true
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        this.isLoading =false
        console.log(res.data, 'ifff')
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

        if (localStorage.getItem('order_type')) {
          const orderType = CryptoJS.AES.decrypt(localStorage.getItem('order_type'), '').toString(CryptoJS.enc.Utf8)
          this.selectedDeliveryType = orderType
        } else {
          var encrypted_order_type = CryptoJS.AES.encrypt(this.selectedDeliveryType, '');
          localStorage.setItem('order_type', encrypted_order_type.toString());
        }
        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color

      } else {
        this.isLoading =false
        console.log('ellls')
        // this.router.navigate(['/not-found'])
      }
    });

    if (localStorage.getItem("OrderData")) {
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      this.itemArray = data;
    }
  }


  get_all_category() {
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };

    this.orderService.get_all_category(obj).subscribe((res) => {
      console.log(res)
      if (res.status == 200) {
        this.getCategoryData = res.data;
        this.findItem(res.data[0]);
      } else {
        this.getCategoryData = 0
      }
    });

  }


  findItem(catData) {
    this.catId = catData._id;
    this.menuId = catData.menu_id;
    this.restId = catData.rest_id;
    this.catName = catData.cate_name;
    this.clicked = catData._id;
    const obj = {
      catId: this.catId,
      menuId: this.menuId,
      restId: this.restId,
    };
    this.orderService.get_all_item(obj).subscribe((res) => {
      console.log(res)
      if (res.status == 200) {
        this.getItemData = res.data.item
      } else if (res.status == 201) {
        this.getItemData = 0
      } else {
        this.router.navigate(['/not-found'])
      }
    });
  }


  addToCart(itemData) {
    // console.log(itemData, 'itemDatakkkkk');
    var index = this.itemArray.findIndex(x => x._id === itemData._id);
    if (index > -1) {
      this.itemArray.splice(index, 0, itemData);
    } else {
      this.itemArray.push(itemData);
    }
    console.log(this.itemArray);
    var userOrderData = CryptoJS.AES.encrypt(JSON.stringify(this.itemArray), '').toString();
    localStorage.setItem('OrderData', userOrderData)
  }

  countOrder(id) {
    var count = (input, arr) => arr.filter(x => x._id === input).length;
    // console.log (count(id, this.itemArray));
    return count(id, this.itemArray);
  }

  removeToCart(value) {
    var index = this.itemArray.findIndex(x => x._id === value);
    if (index > -1) {
      this.itemArray.splice(index, 1);
    }
    var userOrderData = CryptoJS.AES.encrypt(JSON.stringify(this.itemArray), '').toString();
    localStorage.setItem('OrderData', userOrderData)
    return this.itemArray;
  }

  onClick(check) {
    if (check === 1) {
      this.selectedDeliveryType = "1";
      var encrypted_order_type = CryptoJS.AES.encrypt('1', '');
      localStorage.setItem('order_type', encrypted_order_type.toString());
    } else {
      this.selectedDeliveryType = "2";
      var encrypted_order_type = CryptoJS.AES.encrypt('2', '');
      localStorage.setItem('order_type', encrypted_order_type.toString());
    }
  }

  addMap(){
    // console.log('uhjkhjkhg')
    // if(!localStorage.getItem('customer_address')){
    const dialogRef = this.dialog.open(AddressPopupComponent, {
      width: '600px',
      height: '700px',
      // padding: '0px',
      data: {address:'mapicon'}
    });

    dialogRef.afterClosed().subscribe(result => {

    });
    // }

  }

  clickEvent(event){
    //if you just want to toggle the class; change toggle variable.
    this.toggle = !this.toggle;       
 }


}
