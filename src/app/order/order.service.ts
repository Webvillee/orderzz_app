import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { retry } from 'rxjs/operators';
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

  get_restaurant_data(data) {
    return this.http.post<any>(`${this.uri}/get_restaurant_details`, data);
  }

  get_all_category(data) {
    return this.http.post<any>(`${this.uri}/get_all_category`, data);
  }

  get_all_item(data) {
    return this.http.post<any>(`${this.uri}/get_all_Item`, data);
  }

  postAll(link, obj) {
    return this.http.post<any>(`${this.uri}/${link}`, obj);
  }

  getAll(link) {
    return this.http.get<any>(`${this.uri}/${link}`);
  }

  putAll(link, obj) {
    return this.http.put<any>(`${this.uri}/${link}`, obj);
  }

  sendMessage(message: string) {
    this.subject.next({ data: message });
  }

  getMessage() {
    return this.subject.asObservable();
  }

  uploadFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.uri}/file_upload`, formData,
      {
        headers: new HttpHeaders({
          // 'token': localStorage.getItem("token"),
        }),
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      retry(1)
    )
  }

  getToken(): boolean {
    return !!localStorage.getItem('userId');
  }

}
