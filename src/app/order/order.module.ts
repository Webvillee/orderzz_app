import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { CustomiseOrderComponent } from './customise-order/customise-order.component';           // @agm/core

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
  ],
  imports: [
    CommonModule,
    FormsModule,
    AgmCoreModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [OrderService],
  entryComponents: [CustomiseOrderComponent]
})
export class OrderModule { }
