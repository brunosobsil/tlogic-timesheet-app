import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login } from '../interfaces/login-interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url:string = 'https://tlogic-timesheet-api.herokuapp.com/login';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<Login>{
    return this.http.post<Login>(this.url,{email: email, senha: senha});
  }

}
