import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoginService } from './login.service';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})

export class UsuarioService{

    private url: string = 'https://tlogic-timesheet-api-fv2ws.ondigitalocean.app/usuario';
    
    constructor(private loginSvc: LoginService, private http: HttpClient){}
    
    async extratoHoras(dataInicial: Date, dataFinal: Date){
        const token: string = await this.loginSvc.getToken();
        const usuario = await this.loginSvc.getUsuarioAutenticado();
        const header = new HttpHeaders({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
         });
        let d1: string = moment(dataInicial).set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DD HH:mm:ss');
        let d2: string = moment(dataFinal).set({hour:23,minute:59, second: 0}).format('YYYY-MM-DD HH:mm:ss');

        return this.http.get(`${this.url}/${usuario.id}/data_de/${d1}/data_ate/${d2}`, { headers: header });
    }
}