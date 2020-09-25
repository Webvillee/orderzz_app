import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-placed',
  templateUrl: './order-placed.component.html',
  styleUrls: ['./order-placed.component.css']
})
export class OrderPlacedComponent implements OnInit {

  constructor() { 
    localStorage.removeItem("OrderData");
    localStorage.removeItem("order_instruction");
    localStorage.removeItem("mytime");
    localStorage.removeItem("mytime");
    
  }

  ngOnInit(): void {
  }

}
