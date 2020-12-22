import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';
import { UrlSetting } from '../../urlSetting'
import * as CryptoJS from 'crypto-js'
import { NgxSpinnerService } from "ngx-spinner";
import { SocketioService } from '../socketio.service'
import * as geolib from 'geolib';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent, ErrorDialogModel } from '../../shared/dialogs/error-dialog/error-dialog.component';
import { SuccessDialogComponent, SuccessDialogModel } from '../../shared/dialogs/success-dialog/success-dialog.component';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  angForm: FormGroup;
  display: String;
  displaysuccess: String;
  displayError: String;
  themeCondition
  themeView
  customer_address
  banner
  logo
  restName
  restAddress
  minimumOrderValue
  img_url = UrlSetting.image_uri
  PaymentUrl = UrlSetting.uri
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
  itemArray = []
  orderTotal;
  savingCost
  isLoading;
  themeData: any;
  latitude
  longitude
  address
  landmark;
  card_details;
  cardCvv
  promocode
  promosubmit = false;
  isPromoCodeApply = 2;
  totalorderPrice
  userDevicetype: Number
  orderType: Number
  pickupAddress: any;
  pickupLat: any;
  pickupLng: any;
  tax_vat_percent;
  orderSubtotal;
  orderSubtotalamount;
  taxvatpercent = 0;
  promo_code_amount = 0
  isOrderTypeDeliver: boolean;
  isOrderTypePickup: boolean;
  restaurantClosePickup: boolean = false;
  restaurantCloseDelivery: boolean = false;
  startPickupTime: any;
  endPickupTime: any;
  startDeleveryTime: any;
  endDeleveryTime: any;
  restaurantClosePickupMsg: boolean = false;
  restaurantCloseDeliveryMsg: boolean = false;
  zoneData: any = [];
  shippingCost: any = 0;
  deliveryAreaMsg: boolean = false;
  deliveryArea: boolean = false;
  deliveryTime: any;
  deliveryTimeAdd: any;
  cardPaymentStatus: number;
  transactionId: any;
  promocodeGet: any;
  disabledBtn: boolean = false;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private orderService: OrderService, private spinner: NgxSpinnerService, private socketService: SocketioService, public dialog: MatDialog) {

    if (localStorage.getItem('rest_id') == null) {
      this.router.navigate(['/not-found'])
    }

    if (localStorage.getItem('customer_address') == null) {
      this.customer_address = ""
    } else {
      this.customer_address = CryptoJS.AES.decrypt(localStorage.getItem('customer_address'), '').toString(CryptoJS.enc.Utf8);
    }

    if (localStorage.getItem('addressPickup')) {
      this.pickupAddress = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('addressPickup'), '').toString(CryptoJS.enc.Utf8)).address;
    }
    if (localStorage.getItem('order_type')) {
      this.orderType = Number(CryptoJS.AES.decrypt(localStorage.getItem('order_type'), '').toString(CryptoJS.enc.Utf8));
    }
    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))  
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("UserData"), '').toString(CryptoJS.enc.Utf8))
      this.UserData = data
      // console.log(data, 'lll');
      this.userName = data.user_name
      this.email = data.user_email
      this.latitude = data.lat
      this.longitude = data.lng
      this.address = data.address
      this.landmark = data.landmark
    }



    this.angForm = this.fb.group({
      paymentMethod: ['', Validators.required],
    });

    this.get_all_rest_data();
    this.getAllorderData();
    this.getCardDetails();
    this.getDeviceType();

    this.promocodeGet = (localStorage.getItem("promocodeGet")) ? CryptoJS.AES.decrypt(localStorage.getItem("promocodeGet"), '').toString(CryptoJS.enc.Utf8) : ''

    if (this.promocodeGet) {
      this.promocode = this.promocodeGet
      this.applyCode()
    }
  }

  get f() { return this.angForm.controls; }

  get_all_rest_data() {
    // this.isLoading =true
    this.spinner.show();
    const obj = {
      restId: CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    };
    // console.log(obj)
    this.orderService.get_restaurant_data(obj).subscribe((res) => {
      if (res.status == 200) {
        // console.log(res.data.Zone_data)
        this.spinner.hide();
        // this.isLoading =false
        this.themeData = res.data;
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
        this.tax_vat_percent = res.data.tax_vat_percent;
        this.isOrderTypeDeliver = (res.data.is_order_type_deliver == 1) ? true : false
        this.isOrderTypePickup = (res.data.is_order_type_pickup == 1) ? true : false
        var isDefaultDeliveryTime = (res.data.is_default_delivery_time === 1) ? true : false
        var isDefaultPickupTime = (res.data.is_default_pickup_time === 1) ? true : false
        this.startPickupTime = res.data.start_pickup_time
        this.endPickupTime = res.data.end_pickup_time
        this.startDeleveryTime = res.data.start_delevery_time
        this.endDeleveryTime = res.data.end_delevery_time
        this.zoneData = res.data.Zone_data
        let deliveryTrue = []
        if (this.orderType === 1) {
          this.zoneData.filter(e => {
            var zoneArea = (e.zone_cities) ? JSON.parse(e.zone_cities).map(e => ({ lat: e.lat, lng: e.lng })) : ''

            if (e.draw_map_delevery_value === 2) {
              // isPointWithinRadius(point, centerPoint, radius)
              if (geolib.isPointWithinRadius(
                { latitude: Number(this.latitude), longitude: Number(this.longitude) },
                zoneArea[0],
                e.zone_radius
              )) {
                this.shippingCost = e.delevery_fee
                this.deliveryTime = Number(e.minimum_delevery_time)
                this.deliveryTimeAdd = this.deliveryTime + 5
                this.deliveryArea = false
                deliveryTrue.push(1)
                // console.log("inside the radius", this.shippingCost)
                return
              } else {
                // console.log("outside the radius")
                this.deliveryArea = true
              }
            } else if (e.draw_map_delevery_value === 1) {
              // isPointInPolygon(point, polygon)
              if (geolib.isPointInPolygon(
                { lat: Number(this.latitude), lng: Number(this.longitude) },
                zoneArea
              )) {
                this.shippingCost = e.delevery_fee
                this.deliveryTime = Number(e.minimum_delevery_time)
                this.deliveryTimeAdd = this.deliveryTime + 5
                this.deliveryArea = false
                deliveryTrue.push(1)
                // console.log("inside the polygon", this.shippingCost)
                return
              } else {
                // console.log("outside the polygon")
                this.deliveryArea = true
              }
            } else {
              this.deliveryArea = true
            }
            if (deliveryTrue.length !== 0) {
              this.deliveryArea = false
              // console.log(deliveryTrue,"deliveryTrue")
            }
          });
        }
        // console.log(this.isOrderTypePickup, "pickup", "delivery", this.isOrderTypeDeliver, this.startPickupTime, this.endPickupTime)
        this.getAllorderData();
        // this.minimum_order_value = res.data.end_delevery_time
        // this.themeColor = res.data.theme_color
        // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
        if (!localStorage.getItem("OrderData")) {
          this.router.navigate(['/order'])
        }
        const d = new Date();
        // available for restaurent pickup time 
        if (this.isOrderTypePickup) {
          if (isDefaultPickupTime) {
            if (this.startPickupTime <= d.getHours() + ':' + d.getMinutes() && this.endPickupTime >= d.getHours() + ':' + d.getMinutes()) {
              // console.log("####")
              this.restaurantClosePickup = true
            } else {
              this.restaurantClosePickup = false
            }
          } else {
            this.restaurantClosePickup = true
          }
        }


        // available for restaurent delivery time 
        if (this.isOrderTypeDeliver) {
          if (isDefaultDeliveryTime) {
            // console.log("*",this.startDeleveryTime,this.endDeleveryTime ,d.getHours() + ':' + d.getMinutes())
            if (this.startDeleveryTime <= d.getHours() + ':' + d.getMinutes() && this.endDeleveryTime >= d.getHours() + ':' + d.getMinutes()) {
              // console.log("**if1**")
              this.restaurantCloseDelivery = true
            } else {
              // console.log("**if2**")
              this.restaurantCloseDelivery = false
            }
          } else {
            // console.log("**else**")
            this.restaurantCloseDelivery = true
          }
        }
      } else {
        this.router.navigate(['/not-found'])
      }
    });
  }


  getCardDetails() {
    const obj = {
      userId: this.userId
    };
    // console.log(obj)
    this.orderService.postAll('get_card_data', obj).subscribe((res) => {
      if (res.status == 200) {
        // console.log(res.data);
        this.card_details = res.data[0]
      } else {
      }
    });
  }

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      // console.log("tablet");
      this.userDevicetype = 4
    } else if (/Android/i.test(
      ua
    )
    ) {
      // console.log("android");
      this.userDevicetype = 2
    } else if (
      /iPad|iPhone|iPod/i.test(
        ua
      ) && !window.MSStream
    ) {
      // console.log("iPhone");
      this.userDevicetype = 1
    } else {
      // console.log("desktop");
      this.userDevicetype = 3
    }

  };

  changeNumber(str) {
    return str.replace(/.(?=\d{4})/g, "*")
  }

  getAllorderData() {
    if (localStorage.getItem("OrderData")) {
      const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      this.itemArray = data;
      let total = 0
      let savings = 0
      //  console.log(JSON.stringify(this.itemArray))
      const arr_total = this.itemArray

      this.itemArray.map((element, index) => {
        // console.log(element)
        if (element.sell_price === 0) {
          total = total + element.price
        } else {
          total = total + element.sell_price;
          savings = savings + element.price - element.sell_price
        }
        if (element.is_modifire_status === 1) {
          const availmodifire = JSON.parse(element.available_modifire);
          // console.log(availmodifire, 'pppppp');
          for (let step = 0; step < availmodifire.length; step++) {
            // availmodifire[step].modifire.reduce((prev, item) => prev + item.sell_price, 0);
            availmodifire[step].modifire.map(function (el) {
              if (el.isChecked === true) {
                // console.log(el.price, 'elllll');
                total = total + el.price
              }
            })
          }
        }
      });

      this.orderSubtotal = total;
      this.orderSubtotalamount = total
      this.savingCost = savings;

      if (this.tax_vat_percent) {
        let Amount = this.orderSubtotal * this.tax_vat_percent / 100
        let totalamount = this.orderSubtotal + Amount + Number(this.shippingCost);
        this.orderTotal = totalamount;
        this.totalorderPrice = totalamount;
        this.taxvatpercent = Amount
      } else {
        this.orderTotal = this.orderSubtotal + Number(this.shippingCost);
        this.totalorderPrice = this.orderSubtotal + Number(this.shippingCost);
        this.taxvatpercent = 0
      }

      this.savingCost = savings;
      const seen = new Set();
      const filteredArr = data.filter(el => {
        const duplicate = seen.has(el._id);
        seen.add(el._id);
        return !duplicate;
      });
      // this.getItemData = filteredArr
      // console.log(this.getItemData, "OrderData")
    }
  }

  ngOnInit() {
    // this.socketService.orderPlace().subscribe((message) => {
    //     console.log(message)
    //   });
    this.paymentSuccesss();
  }


  onSubmit() {
    var is_submit = true
    var paymentMethod = this.angForm.controls.paymentMethod.value;
    if (this.cardPaymentStatus === 1) {
      paymentMethod = this.cardPaymentStatus
      this.angForm.controls.paymentMethod.setValue(this.cardPaymentStatus)
    }
    // var userEmail = this.angForm.controls.email.value;
    // console.log('7767678888888888888', paymentMethod, this.angForm.invalid);

    this.submitted = true;
    // if (paymentMethod == 1) {
    // if (this.cardCvv === '' || this.cardCvv.trim() === '') {
    //   is_submit = false
    // this.submitted = true;
    // }
    // }
    // console.log(this.restaurantCloseDelivery, 'this.restaurantCloseDelivery')

    // logic for pickup and delivery
    if (this.orderType === 2) {
      if (this.restaurantClosePickup === false) {
        this.submitted = false;
        this.restaurantClosePickupMsg = true
      } else {
        this.submitted = true;
        this.restaurantClosePickupMsg = false
      }
    }

    if (this.orderType === 1) {
      if (this.restaurantCloseDelivery === false) {
        this.submitted = false;
        this.restaurantCloseDeliveryMsg = true
      } else {
        this.submitted = true;
        this.restaurantCloseDeliveryMsg = false
      }
    }


    if (this.deliveryArea == true) {
      this.deliveryAreaMsg = true
      this.submitted = false;
    } else {
      this.deliveryAreaMsg = false
      this.submitted = true;
    }
    // console.log(this.restaurantClosePickup, this.restaurantCloseDelivery, "***")

    // console.log(this.restaurantClosePickup, this.restaurantCloseDelivery, "***")

    // stop here if form is invalid
    if (this.angForm.invalid) {
      return;
    }
    // this.isLoading =true

    let order_instruction = '';
    let items;
    let res_id;


    if (localStorage.getItem('order_instruction')) {
      order_instruction = CryptoJS.AES.decrypt(localStorage.getItem('order_instruction'), '').toString(CryptoJS.enc.Utf8)
    }

    if (this.itemArray) {
      items = JSON.stringify(this.itemArray)
    }

    if (localStorage.getItem('rest_id')) {
      res_id = CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    }

    if (this.orderType === 2) {
      if (localStorage.getItem('addressPickup')) {
        this.pickupAddress = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('addressPickup'), '').toString(CryptoJS.enc.Utf8)).address;
        this.pickupLat = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('addressPickup'), '').toString(CryptoJS.enc.Utf8)).lat;
        this.pickupLng = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('addressPickup'), '').toString(CryptoJS.enc.Utf8)).lng;
      } else {
        this.pickupAddress = ''
        this.pickupLat = ''
        this.pickupLng = ''
      }
    }
    if (paymentMethod && this.restaurantCloseDeliveryMsg === false && this.restaurantClosePickupMsg === false && this.submitted === true) {
      this.spinner.show();
      const obj = { restId: res_id, userId: this.userId, orderType: this.orderType, orderItems: items, orderDescription: order_instruction, totalAmount: this.orderTotal, paymentMethod: Number(paymentMethod), orderReview: 1, isCreditPayment: 1, deleveryAddress: this.address, deleveryLandmark: this.landmark, deleveryLat: Number(this.latitude), deleveryLng: Number(this.longitude), pickupAddress: this.pickupAddress, pickupLat: this.pickupLat, pickupLng: this.pickupLng, totalItemCount: this.itemArray.length, isPromoCodeApply: this.isPromoCodeApply, promoCode: this.promocode, user_device_type: this.userDevicetype, subtotal_amount: this.orderSubtotal, promo_code_amount: this.promo_code_amount, vat_percent: this.tax_vat_percent, vat_percent_value: this.taxvatpercent, order_delevery_cost: this.shippingCost, card_transactionId: this.transactionId }
      this.socketService.getMessages().subscribe((message) => {
        // console.log(message)
      })
      this.orderService.postAll('place_order', obj).subscribe((res) => {
        if (res.status === 200) {
          this.socketService.orderPlace(res.data);
          var encrypted_order_type = CryptoJS.AES.encrypt(JSON.stringify(res.data), '').toString();;
          localStorage.setItem('placedData', encrypted_order_type.toString());

          localStorage.removeItem("OrderData")
          localStorage.removeItem('ordersref');
          localStorage.removeItem('access_token');
          localStorage.removeItem("promocodeGet")
          this.transactionId = ''
          this.display = ''
          this.displaysuccess = "Succussfully";
          this.router.navigate([`/order-tracking/${res.data._id}`]);
          setTimeout(function () { this.displaysuccess = '' }, 3000);
          // this.isLoading =false
          this.spinner.hide();
        } else {
          // this.isLoading =false
          this.spinner.hide();
          this.displaysuccess = ''
          this.display = res.msg;
        }
      });
    } else {
      this.submitted = false;
      // this.isLoading =false
      this.spinner.hide();

    }
    // this.isLoading =false
    this.spinner.hide();

  }

  onReset() {
    this.submitted = false;
    this.angForm.reset();
  }

  onKeypressEvent(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  applyCode() {
    let res_id;
    let totalordervalue = this.orderSubtotalamount
    if (localStorage.getItem('rest_id')) {
      res_id = CryptoJS.AES.decrypt(localStorage.getItem('rest_id'), '').toString(CryptoJS.enc.Utf8)
    }
    const obj = { restId: res_id, userId: this.userId, couponCode: this.promocode.trim() }
    // console.log( '776767888', obj);
    if (this.promocode && (this.promocode || '').trim().length != 0) {
      this.promosubmit = false;
      this.spinner.show();
      let promocode = (this.promocode) ? this.promocode.trim() : ''
      this.orderService.postAll('apply_promo_code', obj).subscribe((res) => {
        if (res.status === 200) {
          var encrypted_promocodeget = CryptoJS.AES.encrypt(promocode, '').toString();;
          localStorage.setItem('promocodeGet', encrypted_promocodeget.toString());

          if (res.data.is_minimum_price_type === 1) {
            if (totalordervalue >= res.data.minimum_price_value) {
              if (res.data.discount_type === 1) {
                let promoAmount = totalordervalue * res.data.discount_type_value / 100
                this.promo_code_amount = promoAmount
                totalordervalue = totalordervalue - promoAmount
                this.isPromoCodeApply = 1
                this.displaysuccess = res.msg;
                this.displayError = ''
              } else if (res.data.discount_type === 2) {
                if (totalordervalue <= res.data.discount_type_value) {
                  this.displayError = `add more items for this coupon`;
                  this.displaysuccess = ''
                } else {
                  totalordervalue = totalordervalue - res.data.discount_type_value
                  this.promo_code_amount = res.data.discount_type_value
                  this.isPromoCodeApply = 1
                  this.displaysuccess = res.msg;
                  this.displayError = ''
                }
              }
            }
          } else {
            if (res.data.discount_type === 1) {
              let promoAmount = totalordervalue * res.data.discount_type_value / 100
              this.promo_code_amount = promoAmount
              totalordervalue = totalordervalue - promoAmount
              this.isPromoCodeApply = 1
              this.displaysuccess = res.msg;
              this.displayError = ''
            } else if (res.data.discount_type === 2) {
              if (totalordervalue <= res.data.discount_type_value) {
                this.displayError = `add more items for this coupon`;
                this.displaysuccess = ''
              } else {
                this.isPromoCodeApply = 1
                totalordervalue = totalordervalue - res.data.discount_type_value;
                this.promo_code_amount = res.data.discount_type_value
                this.displaysuccess = res.msg;
                this.displayError = ''
              }
            }
          }
          this.orderSubtotal = totalordervalue;
          if (this.tax_vat_percent) {
            let Amount = this.orderSubtotal * this.tax_vat_percent / 100
            let totalamount = this.orderSubtotal + Amount + Number(this.shippingCost);
            this.orderTotal = totalamount;
            this.totalorderPrice = totalamount;
            this.taxvatpercent = Amount
          } else {
            this.orderTotal = this.orderSubtotal + Number(this.shippingCost);
            this.totalorderPrice = this.orderSubtotal + Number(this.shippingCost)
            this.taxvatpercent = 0
          }
          this.display = '';
          setTimeout(function () { this.displaysuccess = '' }, 3000);
          setTimeout(function () { this.displayError = '' }, 3000);
          // this.isLoading =false
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.displaysuccess = ''
          this.displayError = res.msg;
        }
        this.spinner.hide();
      });
    } else {
      this.promosubmit = true
    }
  }
  disabledEvent() {
    this.disabledBtn = false
    this.angForm.controls.paymentMethod.setValue(3)
  }

  paymentProcess() {
    this.angForm.controls.paymentMethod.setValue(1)
    if (this.restaurantCloseDelivery === false) {
      this.restaurantCloseDeliveryMsg = true
      this.submitted = false;
      // setTimeout(() => { this.angForm.controls.paymentMethod.setValue('');this.cardPaymentStatus = Number('') }, 1500)
    } else {
      if (this.deliveryArea == true) {
        this.deliveryAreaMsg = true
        this.submitted = false;
        // setTimeout(() => { this.angForm.controls.paymentMethod.setValue('');this.cardPaymentStatus = Number('') }, 1500)
      } else {
        this.deliveryAreaMsg = false
        this.submitted = true;
        this.disabledBtn = true
        this.spinner.show();
        const obj = { realm: "ni" }
        this.orderService.postAll('access-token', obj).subscribe((res) => {
          if (res.statusCode === 200) {
            // console.log(res, "res")

            setTimeout(() => { this.spinner.hide(); }, 3000)
            const resData = JSON.parse(res.body);
            // console.log("resData", resData.access_token);
            if (resData.access_token) {
              // const reqallData = { token: resData.access_token, amount: totalPayment * 100, redirectUri: `http://app.dubaibc.ae/payment-processing/${request_id}`, cancelUri: `http://app.dubaibc.ae/payment-processing/${request_id}` }
              var encrypted_access_token = CryptoJS.AES.encrypt(resData.access_token, '').toString();;
              localStorage.setItem('access_token', encrypted_access_token.toString());
              const reqallData = { token: resData.access_token, amount: this.orderTotal * 100, redirectUri: `${UrlSetting.uriApp}checkout`, cancelUri: `${UrlSetting.uriApp}checkout` }
              // console.log(reqallData, "reqallData")

              this.orderService.postAll('create-order', reqallData).subscribe((res) => {
                if (res.statusCode === 201) {
                  const orderData = JSON.parse(res.body);
                  const ordersref = (orderData._embedded.payment[0]) ? orderData._embedded.payment[0].orderReference : ''
                  var encrypted_ordersref = CryptoJS.AES.encrypt(ordersref, '').toString();;
                  localStorage.setItem('ordersref', encrypted_ordersref.toString());

                  if (orderData._links.payment.href) {
                    window.location.assign(orderData._links.payment.href + '&slim=true');
                    // this.spinner.hide()
                  } else {
                    // console.log(createOrder, 'eklllllll');
                    const dialogDataerror = new ErrorDialogModel("Error", "Payment not processing");
                    let dialogReff = this.dialog.open(ErrorDialogComponent, {
                      maxWidth: "700px",
                      panelClass: 'logout-message',
                      data: dialogDataerror
                    });
                    dialogReff.afterClosed()
                      .subscribe(result => {
                        this.router.navigate(['/checkout']);
                      });

                    localStorage.removeItem('ordersref');
                    localStorage.removeItem('access_token');
                  }
                }
              });
            }
          } else {
            const dialogDataerror = new ErrorDialogModel("Error", "Payment not processing");
            let dialogReff = this.dialog.open(ErrorDialogComponent, {
              maxWidth: "700px",
              panelClass: 'logout-message',
              data: dialogDataerror
            });
            dialogReff.afterClosed()
              .subscribe(result => {
                this.router.navigate(['/checkout']);
              });
            localStorage.removeItem('ordersref');
            localStorage.removeItem('access_token');
          }
        });
      }
    }
  }

  paymentSuccesss() {
    if (localStorage.getItem('ordersref')) {
      const obj = { realm: "ni" }
      this.orderService.postAll('access-token', obj).subscribe((res) => {
        if (res.statusCode === 200) {
          const resData = JSON.parse(res.body);
          // console.log("resData", resData.access_token);
          const access_token = resData.access_token
          const ordersref = CryptoJS.AES.decrypt(localStorage.getItem("ordersref"), '').toString(CryptoJS.enc.Utf8)
          this.transactionId = CryptoJS.AES.decrypt(localStorage.getItem("ordersref"), '').toString(CryptoJS.enc.Utf8)
          // const reqgetData = { token: access_token, ordersref: ordersref }
          if (access_token) {
            let url = `https://api-gateway.sandbox.ngenius-payments.com/transactions/outlets/f17ca305-8b5f-489c-8c56-0a73dba9e64e/orders/${ordersref}`;
            let options = {
              method: 'GET',
              headers: {
                Accept: 'application/vnd.ni-payment.v2+json',
                Authorization: `Bearer ${access_token}`
              }
            };
            fetch(url, options)
              .then((res) => res.json())
              .then(async (json) => {
                const resResult = json;
                // console.log(json, "json");
                if (resResult._embedded.payment[0].state === "CAPTURED") {
                  // console.log("successfully hhhhhh");
                  this.cardPaymentStatus = 1

                  const dialogDatasuccess = new SuccessDialogModel("Success", "Payment Succesfully");
                  let dialogReff = this.dialog.open(SuccessDialogComponent, {
                    maxWidth: "700px",
                    panelClass: 'logout-message',
                    data: dialogDatasuccess
                  });
                  console.log("****")
                  dialogReff.afterClosed()
                    .subscribe(result => {
                      console.log("**")
                      setTimeout(function () { this.onSubmit(); console.log("***")}, 5000);
                    });
                } else {
                  const dialogDataerror = new ErrorDialogModel("Error", "Unable to fetch payment. Please try again or contact your bank");
                  localStorage.removeItem('ordersref');
                  localStorage.removeItem('access_token');
                  let dialogReff = this.dialog.open(ErrorDialogComponent, {
                    maxWidth: "700px",
                    panelClass: 'logout-message',
                    data: dialogDataerror
                  });
                  dialogReff.afterClosed()
                    .subscribe(result => {
                      this.router.navigate(['/checkout']);
                    });
                }
              })
              .catch(err => {
                const dialogDataerror = new ErrorDialogModel("Error", "something went wrong please try again");
                let dialogReff = this.dialog.open(ErrorDialogComponent, {
                  maxWidth: "700px",
                  panelClass: 'logout-message',
                  data: dialogDataerror
                });
                dialogReff.afterClosed()
                  .subscribe(result => {
                    this.router.navigate(['/checkout']);
                  });
                localStorage.removeItem('ordersref');
                localStorage.removeItem('access_token');
              });
          }
        }
      });

    }
  }
}
