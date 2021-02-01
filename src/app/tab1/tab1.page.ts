import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Cliente } from '../interfaces/cliente-interface';
import { ClienteService } from '../services/cliente-service';
import { ModalController } from '@ionic/angular';
import { ModalSelectComponent } from '../components/modal-select/modal-select.component';
import { IonDatetime } from "@ionic/angular";
import { Timesheet } from '../interfaces/timesheet-interface';
import { Apontamento } from '../interfaces/apontamento-interface';
import { AlertController } from '@ionic/angular';
import { TimesheetService } from '../services/timesheet-service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { LoginService } from '../services/login.service';
import { Usuario } from '../interfaces/usuario-interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

  dataAtual: moment.Moment = moment(new Date());
  listaClientes: Cliente[];
  tmsForm: FormGroup;
  @ViewChild("timePicker", { static: true }) timePicker: IonDatetime;
  horaSelecionada: Date;
  timePickerOptions: any;
  timesheet: Timesheet;
  usuarioAutenticado: Usuario;

  constructor(public clienteSvc: ClienteService,
              public modalController: ModalController,
              public alertController: AlertController,
              public timesheetSvc: TimesheetService,
              public loadingController: LoadingController,
              public loginService: LoginService) {
    
    this.tmsForm = new FormGroup({
      observacao: new FormControl('', Validators.required),
      cliente: new FormControl(null, Validators.required),
    });

    this.timesheet = {
      id: null,
      usuario: null,
      cliente: null,
      data: this.dataAtual.toDate(),
      observacao: null,
      apontamentos: []
    }

    this.timePickerOptions = {
      buttons: [{
        text: 'Cancelar',
        handler: () => {}
      },
      {
        text: 'Confirmar',
        handler: async (selected) => {
          let horaApontada = {
            hour: selected.hour.value,
            minute: selected.minute.value
          };
          let datetimeApontado = this.dataAtual;
          this.formToModel(datetimeApontado.set(horaApontada).toDate());
          await this.salvar();
        }
      }
      ]
    }
    
  }

  async ngOnInit(){
    
    let clienteObservable: Observable<Cliente[]> = await this.clienteSvc.getClientes();
    clienteObservable.subscribe(data => {
      this.listaClientes = data;
    });

    this.usuarioAutenticado = await this.loginService.getUsuarioAutenticado();

  }

  getDataAtual(): string{
    this.dataAtual.locale('pt-br');
    return this.dataAtual.format('dddd  - DD/MM/YYYY');
  }

  ontem(){
    this.dataAtual.subtract(1, 'days');
  }

  amanha(){
    this.dataAtual.add(1,'days');
  }

  getClienteOption(){
    let cliente: string;
    if(this.tmsForm.value.cliente){
      cliente = this.tmsForm.value.cliente.id + ' - ' + this.tmsForm.value.cliente.nome;
    }else{
      cliente = '';
    }
    return cliente;
  }

  async selecionarClientes(){
    const lista = this.listaClientes.map((c) => {
      return {codigo: c.id.toString(), descricao: c.nome};
    });
    const modal = await this.modalController.create({
      component: ModalSelectComponent,
      componentProps: {
        lista: lista,
        titulo: 'Clientes'
      }
    });
    modal.onDidDismiss().then((data: any) =>{
      if(data && data.data){
        let selecionado = data.data;
        this.tmsForm.patchValue({
          cliente: {id: Number.parseInt(selecionado.codigo), nome: selecionado.descricao}
        });
      }
    });
    await modal.present();
  }

  async incluirApontamento(){

    let mensagem: string = '';

    if(this.tmsForm.valid){
      this.timePicker.open();
    }else{
      if(this.tmsForm.get('observacao').hasError('required')){
        mensagem = 'Observação é obrigatória!';
      }else if(this.tmsForm.get('cliente').hasError('required')){
        mensagem = 'Cliente é obrigatório!';
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

  showTime(hora: Date){
    let h: moment.Moment = moment(hora);
    return h.format('HH:mm');
  }

  formToModel(datetimeApontado: Date){

    this.timesheet = {
      id: this.timesheet.id,
      usuario: this.usuarioAutenticado,
      cliente: this.tmsForm.value.cliente,
      data: this.dataAtual.toDate(),
      observacao: this.tmsForm.value.observacao,
      apontamentos: this.timesheet.apontamentos
    }
    
    let apontamento: Apontamento = {
      id_timesheet: this.timesheet.id,
      sequencia: this.timesheet.apontamentos.length + 1,
      hora: datetimeApontado
    }
    
    this.timesheet.apontamentos.push(apontamento);

  }

  async salvar(){

    const loading = await this.loadingController.create({
      message: 'Salvando...',
    });

    loading.present();
    
    if(!this.timesheet.id){
      
      let tmsObservable: Observable<any> = await this.timesheetSvc.incluirTimesheet(this.timesheet);
      tmsObservable.subscribe(async data => {
        this.timesheet.id = data.id;
        await loading.dismiss();
      }, async (error: HttpErrorResponse) => {

        await loading.dismiss();
        
        if(error.status === 0){
          this.exibeAlerta('Não foi possível conectar com o servidor. Verifique sua conexão com a internet!');
        }else{
          this.exibeAlerta('Erro desconhecido. Tente novamente mais tarde.');
        }
      });
    }else{
      let tmsObservable: Observable<any> = await this.timesheetSvc.alterarTimesheet(this.timesheet);
      tmsObservable.subscribe(async data => {
        await loading.dismiss();
      }, async (error: HttpErrorResponse) => {
        await loading.dismiss();
        if(error.status === 0){
          this.exibeAlerta('Não foi possível conectar com o servidor. Verifique sua conexão com a internet!');
        }else{
          this.exibeAlerta('Erro desconhecido. Tente novamente mais tarde.');
        }
      });
    }
  }

  async getUsuarioAutenticado() {
    const usuario: Usuario = await this.loginService.getUsuarioAutenticado();
    return usuario;
  }

}
