import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login } from '../interfaces/login-interface';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url:string = 'https://tlogic-timesheet-api.herokuapp.com/login';

  constructor(private http: HttpClient, private storage: Storage) {}

  login(email: string, senha: string): Observable<Login>{
    return this.http.post<Login>(this.url,{email: email, senha: senha});
  }

  async getToken(): Promise<string>{
    const token:string = await this.storage.get('token');
    return token;
  }

}
