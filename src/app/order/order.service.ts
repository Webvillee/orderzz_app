import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlSetting } from '../urlSetting'


@Injectable({
  providedIn: 'root'
})

export class OrderService {
  constructor(private http: HttpClient) { }
  uri = UrlSetting.uri; 

  get_restaurant_data(data){
    return this.http.post<any>(`${this.uri}/get_restaurant_details`, data);
  }

  get_all_category(data){
    return this.http.post<any>(`${this.uri}/get_all_category`, data);
  }

  get_all_item(data){
    return this.http.post<any>(`${this.uri}/get_all_Item`, data);
  }
}
