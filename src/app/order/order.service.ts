import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlSetting } from '../urlSetting'
import { Observable, throwError, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  constructor(private http: HttpClient) { }
  uri = UrlSetting.uri; 
  private subject = new Subject<any>();
  private subjectImage = new Subject<any>();
  private subjectAuth = new BehaviorSubject(null);

  get_restaurant_data(data){
    return this.http.post<any>(`${this.uri}/get_restaurant_details`, data);
  }

  get_all_category(data){
    return this.http.post<any>(`${this.uri}/get_all_category`, data);
  }

  get_all_item(data){
    return this.http.post<any>(`${this.uri}/get_all_Item`, data);
  }


  postAll(link, obj){
    return this.http.post<any>(`${this.uri}/${link}`, obj);
  }

  getAll(link){
    return this.http.get<any>(`${this.uri}/${link}`);
  }

  putAll(link, obj){
    return this.http.put<any>(`${this.uri}/${link}`, obj);
  }

  sendMessage(message: string) {
    this.subject.next({ text: message });
  }

  getMessage() {
    return this.subject.asObservable();
  }

  getToken(): boolean {
    return !!localStorage.getItem('userId');
  }

  
}
