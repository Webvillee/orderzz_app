import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router,UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from './order.service';


@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard {
  constructor(private Dasboardservice:OrderService,private _router:Router){}
  canActivate():boolean{
    if(this.Dasboardservice.getToken())
    {
      return true;
    }
    this._router.navigate(['/location']);
    return true;
  }

}

