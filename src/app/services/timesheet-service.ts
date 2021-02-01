import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from './login.service';
import { Timesheet } from '../interfaces/timesheet-interface';

@Injectable({
    providedIn: 'root'
  })
  export class TimesheetService{

    private url: string = 'https://tlogic-timesheet-api.herokuapp.com/timesheet';
      
    constructor(private loginSvc: LoginService, private http: HttpClient){}

    async incluirTimesheet(timesheet: Timesheet){
        const token: string = await this.loginSvc.getToken();
        const header = new HttpHeaders({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
         });
        return this.http.post(this.url, timesheet, {headers: header });
    }

    async alterarTimesheet(timesheet: Timesheet){
        const token: string = await this.loginSvc.getToken();
        const header = new HttpHeaders({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
         });
        return this.http.post<Timesheet>(`${this.url}/${timesheet.id}`, timesheet , { headers: header });
    }

  }