import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { LoginService } from '../../services/login.service';
import { Login } from '../../interfaces/login-interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  logo: string = "/assets/logo-timesheet.png";
  poweredBy: string = "/assets/powered_by_centered.png";
  loginForm: FormGroup;

  constructor(public alertController: AlertController, 
              public loginSvc: LoginService,
              public storage: Storage,
              public router: Router,
              public loadingController: LoadingController) { 
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      senha: new FormControl('', Validators.required)
    });
    
  }

  async ngOnInit() {
    /*
    const token = await this.loginSvc.getToken();
    const usuario = await this.loginSvc.getUsuarioAutenticado();
    if(token && usuario){
      this.router.navigate(['main/tab1']);
    }
    */
  }

  async entrar(){
    
    if(this.loginForm.valid){

      const loading = await this.loadingController.create({
        message: 'Validando credenciais...',
      });

      await loading.present();
      
      let email: string = this.loginForm.get('email').value;
      email = email.trim();
      let senha: string = this.loginForm.get('senha').value;
      
      this.loginSvc.login(email, senha)
        .subscribe(async (data: Login) => {
          await this.storage.set('token', data.token);
          await this.storage.set('usuario', data.usuario);
          await loading.dismiss();
          this.router.navigate(['main/tab1']);
        },async (error: HttpErrorResponse) => {

          await loading.dismiss();
          
          if(error.status === 401){
            this.exibeAlerta('Usuário não autenticado!');
          }else if(error.status === 0){
            this.exibeAlerta('Não foi possível conectar com o servidor. Verifique sua conexão com a internet!');
          }else{
            this.exibeAlerta('Erro desconhecido. Tente novamente mais tarde.');
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
