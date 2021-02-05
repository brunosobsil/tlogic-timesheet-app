import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from './login.service';
import { Timesheet } from '../interfaces/timesheet-interface';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
  })
  export class TimesheetService{

    private url: string = 'https://tlogic-timesheet-api-fv2ws.ondigitalocean.app/timesheet';
      
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
        return this.http.put<Timesheet>(`${this.url}/${timesheet.id}`, timesheet , { headers: header });
    }

    async obterTimesheets(data_de: Date, data_ate: Date, id_cliente_de: number, id_cliente_ate: number, id_usuario_de: number, id_usuario_ate: number){
        const token: string = await this.loginSvc.getToken();
        const header = new HttpHeaders({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
         });
        let d1: string = moment(data_de).set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DD HH:mm:ss');
        let d2: string = moment(data_ate).set({hour:23,minute:59, second: 0}).format('YYYY-MM-DD HH:mm:ss');

        return this.http.get<Timesheet[]>(`${this.url}/data_de/${d1}/data_ate/${d2}/cliente_de/${id_cliente_de}/cliente_ate/${id_cliente_ate}/usuario_de/${id_usuario_de}/usuario_ate/${id_usuario_ate}`, { headers: header });
    }

  }