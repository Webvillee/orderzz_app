import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { OrderModule } from './order/order.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';


// const routes: Routes = [
//   {path: '',redirectTo:'', pathMatch: 'full'},
//   {path: '', loadChildren: () => import('./order/order.module').then(m => m.OrderModule)},
//   {path: 'control-panel/dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)},
// ];

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', loadChildren: () => import('./order/order.module').then(m => m.OrderModule) },
  { path: 'control-panel/dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OrderModule,
    DashboardModule,
    SharedModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
