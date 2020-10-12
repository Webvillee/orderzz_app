import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ErrorDialogComponent } from '../../shared/dialogs/error-dialog/error-dialog.component';
import { ErrorHandlerService } from '../../shared/error-handler.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
@Component({
  selector: 'app-customise-order',
  templateUrl: './customise-order.component.html',
  styleUrls: ['./customise-order.component.css']
})
export class CustomiseOrderComponent implements OnInit {
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
  itemArray = [];
  getItemData;

  orderTotal;
  savingCost;
  shippingCost;
  itemData: any;
  available_modifire = [];
  selectedItemArray = []
  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService, private errorService: ErrorHandlerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CustomiseOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }
    this.itemData = data;
    this.available_modifire = JSON.parse(data.available_modifire);
    // for (let step = 0; step < this.available_modifire.length; step++) {

    //   var result = this.available_modifire[step].modifire.map(function (el) {
    //     var o = Object.assign({}, el);
    //     o.isChecked = false;
    //     return o;
    //   })
    //   this.available_modifire[step].modifire = result
    //   // this.available_modifire[step].modifire.map(v => ({...v, isChecked: false}))
    //   // console.log(this.available_modifire[step].modifire, '999', result);
    // }

    console.log(this.itemData, 'hellooo');
    this.get_all_rest_data();
    this.getAllorderData();
  }

  get_all_rest_data() {
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {

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
      this.orderTotal = total;

      this.itemArray.map((element, index) => {
        if (element.is_modifire_status === 1) {
          const availmodifire = JSON.parse(element.available_modifire);
          // console.log(availmodifire, 'pppppp');
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

      this.orderTotal = total;
      let sellPrice = this.itemArray.reduce((prev, item) => prev + item.sell_price, 0);
      this.savingCost = sellPrice;
      const seen = new Set();
      const filteredArr = data.filter(el => {
        const duplicate = seen.has(el._id);
        seen.add(el._id);
        return !duplicate;
      });
      this.getItemData = filteredArr
    }
  }

  addToCart(itemData) {
    var index = this.itemArray.findIndex(x => x._id === itemData._id);
    if (index > -1) {
      this.itemArray.splice(index, 0, itemData);
    } else {
      this.itemArray.push(itemData);
    }
    // console.log(this.itemArray);
    var userOrderData = CryptoJS.AES.encrypt(JSON.stringify(this.itemArray), '').toString();
    localStorage.setItem('OrderData', userOrderData);
    this.getAllorderData();
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
    localStorage.setItem('OrderData', userOrderData);
    this.getAllorderData();
    return this.itemArray;
  }

  close() {
    this.dialogRef.close();
  }

  changeSelection(event, modifiersVal, modifire) {
    // console.log('7666666666',event.target.checked);
     this.itemArray.map((element, index) => {
        if (element._id === this.itemData._id) {
          const availmodifire = JSON.parse(element.available_modifire);
          const modifiersIndex = availmodifire.findIndex(z => z._id === modifire._id)
          // console.log(modifiersIndex, 'ppppp',  availmodifire[modifiersIndex].modifire);
          const modifiersValIndex = availmodifire[modifiersIndex].modifire.findIndex(y => y._id == modifiersVal._id);
          let updatedModifire= availmodifire[modifiersIndex].modifire[modifiersValIndex];
        
         
          if(event.target.checked===true){
            updatedModifire.isChecked = true
          }else if(event.target.checked===false){
            updatedModifire.isChecked = false
          }
          console.log(updatedModifire.isChecked);
          element.available_modifire = JSON.stringify(availmodifire)
          this.itemData = element
        }
      });

    }

  save() {
    // console.log('8888', this.itemData);
    let testArr = []
    this.available_modifire = JSON.parse(this.itemData.available_modifire);
    for (let step = 0; step < this.available_modifire.length; step++) {
      var count = (input, arr) => arr.filter(x => x.isChecked === input).length;
      // console.log (count(id, this.itemArray));
      const allCount = count(true, this.available_modifire[step].modifire);
      // console.log(this.available_modifire[step].minimum_modifiers, '!==', allCount)
      if (this.available_modifire[step].minimum_modifiers > allCount) {
        this.available_modifire[step].isRequired = true;
        testArr.push("1");
        testArr = testArr
      } else {
        testArr.push("2");
        testArr = testArr
      }

      // console.log(this.available_modifire[step].minimum_modifiers, 'ooo', allCount);

    }
    let n = testArr.includes("1");
    if (n === false) {
      // console.log(testArr, '767676');
      var userOrderData = CryptoJS.AES.encrypt(JSON.stringify(this.itemArray), '').toString();
      localStorage.setItem('OrderData', userOrderData);
      this.dialogRef.close();
    }


  }

  ngOnInit(): void {
  }

}
