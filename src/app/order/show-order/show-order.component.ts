import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddressPopupComponent } from '../address-popup/address-popup.component'
import { SuccessDialogComponent, SuccessDialogModel } from '../../shared/dialogs/success-dialog/success-dialog.component';
import { NgxSpinnerService } from "ngx-spinner";
import { SocketioService } from '../socketio.service'
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-show-order',
  templateUrl: './show-order.component.html',
  styleUrls: ['./show-order.component.css'],
})
export class ShowOrderComponent implements OnInit {
  public selectedDeliveryType = "1";
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
  private toggle: boolean = false;
  isLoading;
  userId
  is_online_status;
  opening_hours
  opening_hours_status: boolean = false;
  allData
  isOrderTypeDeliver: boolean;
  isOrderTypePickup: boolean;
  startDeleveryTime: any;
  endDeleveryTime: any;
  startPickupTime: any;
  endPickupTime: any;
  restaurantClose: boolean = false;
  restaurantClosePickup: boolean = false;
  restaurantCloseDelivery: boolean = false;
  showtime= ''
  keyResult
  is_card_payment
  is_cash_payment
  page_no = 1
  perPage = 3
  orderHistory = [];
  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService, public dialog: MatDialog, private spinner: NgxSpinnerService, private socketService: SocketioService) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
    }

    if (localStorage.getItem('order_type')) {
      const orderType = CryptoJS.AES.decrypt(localStorage.getItem('order_type'), '').toString(CryptoJS.enc.Utf8)
      this.selectedDeliveryType = orderType
      // console.log(this.selectedDeliveryType,'this.selectedDeliveryType')
    }
    this.get_all_rest_data()
    this.get_all_category()
  }

  ngOnInit() {
    // this.socketService.orderPlace().subscribe((message) => {
    //     console.log(message)
    //   });
  }


  ngAfterContentChecked() {
    // this.socketService.orderPlace();
    if (localStorage.getItem('customer_address')) {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    } else {
      this.customer_address = ""
    }
  }

  get_all_rest_data() {
    // this.isLoading = true
    this.spinner.show();
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        // this.isLoading = false
        this.spinner.hide();
        // console.log(res.data, 'ifff')
        this.themeView = res.data.theme_view
        if (this.themeView == "1") {       //1=listview in  and 2= gridmeans
          this.themeCondition = false
        } else {
          this.themeCondition = true
        }
        this.allData = res.data
        this.banner = res.data.rest_banner
        this.logo = res.data.rest_logo
        this.restName = res.data.rest_name
        this.restAddress = res.data.rest_full_address
        this.minimumOrderValue = res.data.minimum_order_value
        this.is_online_status = res.data.is_online_status
        this.opening_hours = JSON.parse(res.data.opening_hours);
        this.isOrderTypeDeliver = (res.data.is_order_type_deliver == 1) ? true : false
        this.isOrderTypePickup = (res.data.is_order_type_pickup == 1) ? true : false
        this.startDeleveryTime = res.data.start_delevery_time
        this.endDeleveryTime = res.data.end_delevery_time
        this.startPickupTime = res.data.start_pickup_time
        this.endPickupTime = res.data.end_pickup_time
        this.is_card_payment=res.data.is_card_payment;
        this.is_cash_payment=res.data.is_cash_payment;
        // console.log(CryptoJS.AES.decrypt(localStorage.getItem('lat'), '').toString(CryptoJS.enc.Utf8), CryptoJS.AES.decrypt(localStorage.getItem('lng'), '').toString(CryptoJS.enc.Utf8), 'okkkkkkkkkk')
        const lat1 = res.data.rest_lat;
        const lon1 = res.data.rest_lng;
        let lat2
        let lon2
        (localStorage.getItem('lat'))? lat2 = CryptoJS.AES.decrypt(localStorage.getItem('lat'), '').toString(CryptoJS.enc.Utf8) : lat2 = '';
        (localStorage.getItem('lng'))? lon2 = CryptoJS.AES.decrypt(localStorage.getItem('lng'), '').toString(CryptoJS.enc.Utf8): lon2 ='';
        
        // console.log('lat1=>', lat1, 'lon1=>', lon1, 'lat2=>', lat2, 'lon2=>', lon2);

        if (lat1!== '' && lon1 !== '' && lat2!== '' && lon2!== '') {
          var rad = function (x) {
            return x * Math.PI / 180;
          };

          var R = 6378137; // Earth’s mean radius in meter
          var dLat = rad(lat2 - lat1);
          var dLong = rad(lon2 - lon1);
          var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var dist = (R * c)
          // console.log(dist/ 1000, 'In km llllllll', dist);

          const distance_in_kms = dist / 1000
          const kms_per_min = 0.5
          const mins_taken = distance_in_kms / kms_per_min;
          const totalMinutes =  mins_taken;

          if (totalMinutes<60)
          {
            let num = totalMinutes;
            var n = num.toFixed(2);
            let rminutes = (n + "").split(".")[1]
            this.showtime = rminutes + " mins";
          }else {
            // console.log( (totalMinutes / 60))
            let num = totalMinutes;
            let hours = (num / 60);
            let rhours = Math.floor(hours);
            let minutes = (hours - rhours) * 60;
            let rminutes = Math.round(minutes);
            this.showtime = rhours + " hour " + rminutes + " mins";
          }
        }

        // console.log(this.startDeleveryTime, this.endDeleveryTime, this.startPickupTime, this.endPickupTime, 'time');

        // For adding active class dynamically
        if (!localStorage.getItem('order_type')) {
        if (this.isOrderTypeDeliver === true) {
          this.selectedDeliveryType = "1";
          var encrypted_order_type = CryptoJS.AES.encrypt('1', '');
          localStorage.setItem('order_type', encrypted_order_type.toString());
        }
        if (this.isOrderTypePickup === true) {
          this.selectedDeliveryType = "2";
          var encrypted_order_type = CryptoJS.AES.encrypt('2', '');
          localStorage.setItem('order_type', encrypted_order_type.toString());
        }
      }

        const d = new Date();
        let weekday = ['Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'][d.getDay()]


        // for restaurent time checking
        this.opening_hours.map((element, index) => {
          // console.log(element.name, 'element.name', element, element.name == weekday && element.openstatus === true);
          if (element.name == weekday && element.openstatus === true) {
            if (element.startTime <= d.getHours() + ':' + d.getMinutes() && element.endTime >= d.getHours() + ':' + d.getMinutes()) {
              this.restaurantClose = true
            }
          }
        });

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
        // this.isLoading = false
        this.spinner.hide();
        // console.log('ellls');
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
      // console.log(res)
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
      page_no: this.page_no,
      perPage: this.perPage
    };
    this.orderService.get_all_item(obj).subscribe((res) => {
      // console.log(res)
      if (res.status == 200) {
        // console.log(res.data)
        this.getItemData = res.data.item
        this.orderCount = res.data.count;
        this.orderHistory = res.data.item
        this.keyResult= res.data.keyResult
      } else if (res.status == 201) {
        // console.log(res.data)
        this.getItemData = res.data.item
        this.keyResult= res.data.keyResult
        this.orderCount = res.data.count;
        this.orderHistory = res.data.item
      } else {
        this.router.navigate(['/not-found'])
      }
    });
  }
  onScroll() {
    this.page_no++;
    const obj = {
      catId: this.catId,
      menuId: this.menuId,
      restId: this.restId,
      page_no: this.page_no,
      perPage: this.perPage
    };
    this.orderService.get_all_item(obj).subscribe((res) => {
      this.spinner.show();
      // console.log(res)
      if (res.status == 200) {
        if (res.data != 0 && this.orderHistory.length < this.orderCount) {
          res.data.item.forEach(childObj => {
            this.orderHistory.push(childObj);
          });
        }
        this.spinner.hide();
      } else if (res.status == 201) {
        if (res.data != 0 && this.orderHistory.length < this.orderCount) {
          res.data.item.forEach(childObj => {
            this.orderHistory.push(childObj);
          });
          this.spinner.hide();
        }       
      } else{
        this.spinner.hide();
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
    // console.log(this.itemArray);
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

  addMap() {
    const dialogRef = this.dialog.open(AddressPopupComponent, {
      width: '600px',
      height: '700px',
      panelClass: 'address-class',
      data: { address: 'mapicon' }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.get_all_rest_data()
    });
  }

  clickEvent(event) {
    //if you just want to toggle the class; change toggle variable.
    this.toggle = !this.toggle;
  }

  public logout() {
    const message = `Are you sure you want to Logout this session?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    // const dialogDatasuccess = new SuccessDialogModel("Success", "Succesfully Logout");

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "700px",
      panelClass: 'logout-message',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      const result = dialogResult;
      if (result) {
        localStorage.removeItem('UserData');
        localStorage.removeItem('userId');
        localStorage.removeItem('usersid');
        localStorage.removeItem('otp');
        localStorage.removeItem('order_instruction');
        localStorage.removeItem('userName');
        localStorage.removeItem('signup_process');
        localStorage.removeItem('mobilenoGet');
        const dialogDatasuccess = new SuccessDialogModel("Success", "Succesfully Logout");
        let dialogReff = this.dialog.open(SuccessDialogComponent, {
          maxWidth: "700px",
          panelClass: 'logout-message',
          data: dialogDatasuccess
        });
        dialogReff.afterClosed()
          .subscribe(result => {
            this.userId = ''
            this.router.navigate(['/order']);
          });
      }
    });
  }
  singUp(){
    let encrypted_signup = CryptoJS.AES.encrypt('signup_process', '');
    localStorage.setItem('signup_process', encrypted_signup.toString());
  }
}
