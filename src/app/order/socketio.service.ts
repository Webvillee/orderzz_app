import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as CryptoJS from 'crypto-js'
import { Observable} from 'rxjs'
// import * as Rx from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;
  userId
  constructor(private toastr: ToastrService) { }
  public setupSocketConnection() {
    // this.userId=CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
    this.socket = io(environment.SOCKET_ENDPOINT);

    if (localStorage.getItem('userId')) {
      this.userId = CryptoJS.AES.decrypt(localStorage.getItem('userId'), '').toString(CryptoJS.enc.Utf8)
      // const data = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("OrderData"), '').toString(CryptoJS.enc.Utf8))
      this.socket.emit('join_chat', `join chat ${this.userId}`);
      
      this.socket.on('join_chat_ack', (data) => {
        console.log(data);
      });

      this.socket.on('join_chat_ack1', (data) => {
        console.log(data, 'ack1');
      });
      
      this.socket.on('push_notification', (data) => {
        console.log(data, 'hiiiiiiiiiiiiiiiiiiiiidemooo');
      });
    }

  }

  public orderPlace(order_data){
    this.socket.emit('order_placed', order_data);
  }


}