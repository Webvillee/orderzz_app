import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlSetting } from '../urlSetting'


@Injectable({
  providedIn: 'root'
})

export class OrderService {
  constructor(private http: HttpClient) { }
  uri = UrlSetting.uri; 

  get_restaurant_data(slugId){
    const obj = {
      slugId:slugId,
    };
    return this.http.post<any>(`${this.uri}/get_restaurant_data`, obj);
  }

}
