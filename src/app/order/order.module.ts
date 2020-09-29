import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthguardGuard } from './authguard.guard';
import { Routes, RouterModule } from '@angular/router';
import { OrderComponent } from './order.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { OrderService  } from './order.service';
import { SharedModule } from '../shared/shared.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { ShowLocationComponent } from './show-location/show-location.component';
import { HeaderComponent } from './header/header.component';
import { ShowOrderComponent } from './show-order/show-order.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

import { AgmCoreModule } from '@agm/core';
import { ViewBasketComponent } from './view-basket/view-basket.component';
import { CustomiseOrderComponent } from './customise-order/customise-order.component';
import { PhoneVerificationComponent } from './phone-verification/phone-verification.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { ConfirmAddressComponent } from './confirm-address/confirm-address.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderPlacedComponent } from './order-placed/order-placed.component';
import { AddressPopupComponent } from './address-popup/address-popup.component';
import { ViewOrdersHistoryComponent } from './view-orders-history/view-orders-history.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
       // @agm/core

// const routes: Routes = [
//   {
//     path: '',
//     component: OrderComponent,
//     children: [
//       {path: '',redirectTo:'/', pathMatch: 'full'},
//       {path: ':id',component:WelcomeComponent},
//       {path: 'welcome',component:WelcomeComponent},

//       {path: 'location',component:ShowLocationComponent},
//       {path: 'order',component:ShowOrderComponent},

//     ]
//   }
// ];

const routes: Routes = [
  {
    path: '',
    component: OrderComponent,
    children: [
     // {path: '',redirectTo:'/welcome', pathMatch: 'full'},
    //  {path: 'welcome',component:WelcomeComponent},
      {path: 'location', component:ShowLocationComponent},
      {path: 'order', component:ShowOrderComponent},
      {path: 'view-basket', component:ViewBasketComponent},

      {path: 'phone-verification', component:PhoneVerificationComponent},
      {path: 'otp', component:OtpVerificationComponent},
      {path: 'personal-details', component:PersonalDetailsComponent},
      {path: 'confirm-address', component:ConfirmAddressComponent},

      {path: 'checkout', component:CheckoutComponent, canActivate: [AuthguardGuard]},
      {path: 'order-placed', component:OrderPlacedComponent, canActivate: [AuthguardGuard]},
      
      {path: 'order-history',component:ViewOrdersHistoryComponent, canActivate: [AuthguardGuard]},
      {path: 'update-profile',component:UpdateProfileComponent, canActivate: [AuthguardGuard]},

      {path: 'not-found',component:PagenotfoundComponent},
      {path: ':id',component:WelcomeComponent},
      {path: '**', component:PagenotfoundComponent},
      

    ]
  }
];

@NgModule({
  declarations: [
    WelcomeComponent,
    OrderComponent,
    ShowLocationComponent,
    HeaderComponent,
    ShowOrderComponent,
    PagenotfoundComponent,
    ViewBasketComponent,
    CustomiseOrderComponent,
    PhoneVerificationComponent,
    OtpVerificationComponent,
    PersonalDetailsComponent,
    ConfirmAddressComponent,
    CheckoutComponent,
    OrderPlacedComponent,
    AddressPopupComponent,
    ViewOrdersHistoryComponent,
    UpdateProfileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AgmCoreModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [OrderService, AuthguardGuard],
  entryComponents: [CustomiseOrderComponent, ConfirmAddressComponent]
})
export class OrderModule { }
