import { Component, OnInit } from '@angular/core';
import { SuccessDialogComponent, SuccessDialogModel } from '../../shared/dialogs/success-dialog/success-dialog.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pickup-location',
  templateUrl: './pickup-location.component.html',
  styleUrls: ['./pickup-location.component.css']
})
export class PickupLocationComponent implements OnInit {
  angForm: FormGroup;
  display: String;
  displaysuccess: String;
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
  submitted = false;
  userId;
  UserData;
  userName;
  email;
  isLoading = false;
  mobileno
  pickupData: any =[];
  constructor(private fb: FormBuilder, public dialog: MatDialog, private route: ActivatedRoute, private router: Router, private orderService: OrderService) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }

    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
    }
    if (localStorage.getItem('UserData')) {
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
      // this.UserData= data
      // console.log(data, 'lll');
      this.userName = data.user_name;
      this.email = data.user_email;
      this.mobileno = data.user_contact_no;
    }

    this.angForm = this.fb.group({
      pickupAddress: ['', Validators.required],
    });


    this.get_all_rest_data();
  }

  get f() { return this.angForm.controls; }

  ngAfterContentChecked() {
    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))

      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
      // this.UserData=data
      // // console.log(data, 'lll')
      //   this.userName= data.user_name
      //   this.email= data.user_email
    }

  }

  get_all_rest_data() {
    this.isLoading = true
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        this.isLoading = false
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
        this.pickupData = JSON.parse(res.data.pickup_data[0].pickup_cities)
        // console.log(this.pickupData ,"pickup data")
        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color

      } else {
        this.isLoading = false
        this.router.navigate(['/not-found'])
      }
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.angForm.controls[control].hasError(error);
  }

  onSubmit() {
      var pickup = []
      pickup.push(this.angForm.value.pickupAddress) 
      if(pickup.length !=0){
        var encrypted_pickupAddress = CryptoJS.AES.encrypt(JSON.stringify(pickup), '');
        localStorage.setItem('pickupAddress', encrypted_pickupAddress.toString());
        this.router.navigate(['/checkout'])
      }
  }
  onKeypressEvent(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onReset() {
    this.submitted = false;
    this.angForm.reset();
  }

  ngOnInit(): void {
  }

}
