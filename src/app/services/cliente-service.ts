import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cliente } from '../interfaces/cliente-interface';
import { LoginService } from './login.service';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ClienteService {

    private url: string = 'https://tlogic-timesheet-api-fv2ws.ondigitalocean.app/cliente';

    constructor(private http: HttpClient, private loginSvc: LoginService){
    }

    async getCliente(cliente: Cliente): Promise<Observable<Cliente>>{
        const token: string = await this.loginSvc.getToken();
        const header = new HttpHeaders({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
         });
        return this.http.get<Cliente>(`${this.url}/${cliente.id}`, { headers: header });
    }

    async getClientes(): Promise<Observable<Cliente[]>> {
        const token: string = await this.loginSvc.getToken();
        const header = new HttpHeaders({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
         });
        return this.http.get<Cliente[]>(this.url, { headers: header });
    }
}
