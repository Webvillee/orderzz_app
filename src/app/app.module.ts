import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { OrderModule } from './order/order.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';
import { NotifierModule } from "angular-notifier";
import { AgmCoreModule } from '@agm/core';            // @agm/core
import { NgxSpinnerModule } from "ngx-spinner";
import { UrlSetting } from "./urlSetting";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ToastrModule } from 'ngx-toastr';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.SOCKET_ENDPOINT, options: {} };

const routes: Routes = [
  { path: '', loadChildren: () => import('./order/order.module').then(m => m.OrderModule), pathMatch: 'full' },
  { path: 'control-panel/dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
];



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    NgxSpinnerModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    HttpClientModule,
    OrderModule,
    DashboardModule,
    SharedModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    NgxSpinnerModule,
    InfiniteScrollModule,
    SocketIoModule.forRoot(config),
    AgmCoreModule.forRoot({ // @agm/core
      apiKey: UrlSetting.agm_core_key,
      libraries: ['places']
    }),
    ToastrModule.forRoot(),
    // ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' })
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class AppModule { }

