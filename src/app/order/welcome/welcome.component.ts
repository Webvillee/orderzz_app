import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../order.service';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  getRestData
  constructor( private route: ActivatedRoute, private router: Router,private orderService: OrderService ) { 
    
    const slugId = this.route.snapshot.paramMap.get('id');

    // this.orderService.get_restaurant_data(slugId).subscribe((res) => {
    //   if (res.status == 200) {
    //     this.getRestData = res.data
    //   } else {
    //     this.getRestData = [];
    //   }
    // });

  }

  ngOnInit(): void {
  }

}
