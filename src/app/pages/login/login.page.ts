import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { LoginService } from '../../services/login.service';
import { Login } from '../../interfaces/login-interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  logo: string = "/assets/logo-timesheet.png";
  poweredBy: string = "/assets/powered_by.png";
  loginForm: FormGroup;

  constructor(public alertController: AlertController, public loginSvc: LoginService) { 
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      senha: new FormControl('', Validators.required)
    });
    
  }

  ngOnInit() {
  }

  entrar(){
    
    if(this.loginForm.valid){
      
      let email: string = this.loginForm.get('email').value;
      email = email.trim();
      let senha: string = this.loginForm.get('senha').value;
      
      this.loginSvc.login(email, senha)
        .subscribe((data: Login) => {
          console.log(data);
        },(error: HttpErrorResponse) => {
          console.log(error);
          if(error.status === 401){
            this.exibeAlerta('Usuário não autenticado!');
          }else if(error.status === 0){
            this.exibeAlerta('Não foi possível conectar com o servidor. Verifique sua conexão com a internet!');
          }
        });
      
    }else{

      let mensagem: string = '';
      
      if(this.loginForm.get('email').hasError('required')){
        mensagem = 'E-mail é obrigatório!';
      }else if(this.loginForm.get('email').hasError('email')){
        mensagem = 'E-mail inválido!';
      }else if(this.loginForm.get('senha').hasError('required')){
        mensagem = 'Senha é obrigatória!';
      }

      this.exibeAlerta(mensagem);
      
    } 
    
  }

  async exibeAlerta(mensagem: string){
    const alerta = await this.alertController.create({
      header: 'Atenção!',
      cssClass: 'alert',
      backdropDismiss: false,
      message: mensagem,
      buttons: ['OK']
    });
    await alerta.present();
  }

}
