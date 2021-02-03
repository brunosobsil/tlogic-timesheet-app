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
import { ActionSheetController } from '@ionic/angular';

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
  opcao: number = 1;
  apontamentoSelecionado: Apontamento;
  totalHoras: string = '00:00';

  constructor(public clienteSvc: ClienteService,
              public modalController: ModalController,
              public alertController: AlertController,
              public timesheetSvc: TimesheetService,
              public loadingController: LoadingController,
              public loginService: LoginService,
              public actionSheetController: ActionSheetController) {
    
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
          if(!this.jaApontou(datetimeApontado.set(horaApontada))){
            this.formToModel(this.opcao, datetimeApontado.set(horaApontada).toDate());
            await this.salvar(this.opcao);
          }else{
            this.exibeAlerta('Horário já foi apontado!');
            return false;
          }
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

  changeDate(dias: number){
    if(dias > 0 ){
      this.dataAtual.add(dias,'days');
    }else{
      this.dataAtual.subtract(dias*-1, 'days');
    }
    this.initialValues();

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
    modal.onDidDismiss().then(async (data: any) =>{
      if(data && data.data){

        let selecionado = data.data;

        const loading = await this.loadingController.create({
          message: 'Carregando...',
        });
    
        loading.present();

        // verifica se tem registro no banco para esse dia/cliente
        let timesheets = await this.timesheetSvc.obterTimesheets(this.dataAtual.toDate(), 
                                                                 this.dataAtual.toDate(),
                                                                 selecionado.codigo,
                                                                 selecionado.codigo,
                                                                 this.usuarioAutenticado.id,
                                                                 this.usuarioAutenticado.id);
        
        timesheets.subscribe(data => {
          loading.dismiss();
          if(data.length > 0){
            let timesheetDb = data[0];
            this.timesheet.id = timesheetDb.id;
            this.timesheet.observacao = timesheetDb.observacao;
            this.timesheet.cliente = {id: Number.parseInt(selecionado.codigo), nome: selecionado.descricao, valor_hora: null};
            this.timesheet.usuario = this.usuarioAutenticado;
            this.timesheet.apontamentos = timesheetDb.apontamentos.map(a => {
              return {id_timesheet: timesheetDb.id, sequencia: a.sequencia, hora: new Date(a.hora)}
            });
            this.tmsForm.patchValue({
              observacao: this.timesheet.observacao,
              cliente: {id: Number.parseInt(selecionado.codigo), nome: selecionado.descricao}
            });
            this.totalHoras = this.calculaTotal();
          }else{
            this.tmsForm.patchValue({
              cliente: {id: Number.parseInt(selecionado.codigo), nome: selecionado.descricao}
            });
          }
        });

      }
    });
    await modal.present();
  }

  async incluirApontamento(){

    let mensagem: string = '';

    if(this.tmsForm.valid){
      this.timePicker.value = new Date().toISOString();
      this.timePicker.open();
    }else{
      if(this.tmsForm.get('cliente').hasError('required')){
        mensagem = 'Cliente é obrigatório!';
        this.exibeAlerta(mensagem);
      }else if(this.tmsForm.get('observacao').hasError('required') && this.timesheet.apontamentos.length >= 3){
        mensagem = 'Não esqueça de informar as suas atividades!';
        this.exibeAlerta(mensagem);
        this.timePicker.open();
      }else{
        this.timePicker.open();
      }
      
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

  formToModel(opcao: number, datetimeApontado: Date){

    switch(opcao){

      case 1: { // incluir
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
        this.reprocessaSequencia();
        break;
      }
      case 2: { // alterar
        this.timesheet.apontamentos = this.timesheet.apontamentos.map(a => {
          if(a.sequencia === this.apontamentoSelecionado.sequencia){
            a = {id_timesheet: a.id_timesheet, sequencia: a.sequencia, hora: datetimeApontado}
          };
          return a;
        });
        this.reprocessaSequencia();
        break;
      }
      case 3: { // Excluir
        this.timesheet.apontamentos.splice(this.apontamentoSelecionado.sequencia-1,1);
        this.reprocessaSequencia();
        break;
      }
    }
    this.totalHoras = this.calculaTotal();

  }

  async salvar(opcao: number){

    const loading = await this.loadingController.create({
      message: 'Salvando...',
    });

    loading.present();

    switch(opcao){

      case 1: // Incluir Apontamento
      {
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
        break;
      }
      case 2: // Alterar Apontamento
      {
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
    this.opcao = 1;
  }

  async getUsuarioAutenticado() {
    const usuario: Usuario = await this.loginService.getUsuarioAutenticado();
    return usuario;
  }

  initialValues(){
    this.timesheet = {
      id: null,
      usuario: null,
      cliente: null,
      data: this.dataAtual.toDate(),
      observacao: null,
      apontamentos: []
    },
    this.tmsForm.reset();
  }

  async opcoesEdicao(apontamento: Apontamento){
    this.apontamentoSelecionado = apontamento;
    const actionSheet = await this.actionSheetController.create({
      header: 'Opções',
      buttons: [
      {
        text: 'Alterar',
        icon: 'pencil-outline',
        handler: () => {
          this.timePicker.value = apontamento.hora.toISOString();
          this.opcao = 2;
          this.timePicker.open();
        }
      },
      {
        text: 'Excluir',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.opcao = 3;
          this.formToModel(this.opcao, null);
          this.salvar(2);
        }
      },
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          this.opcao = 1;
        }
      }]
    });
    await actionSheet.present();
  }

  reprocessaSequencia(){
    this.timesheet.apontamentos = this.timesheet.apontamentos.sort((a,b) => a.hora.getTime() - b.hora.getTime());
    this.timesheet.apontamentos = this.timesheet.apontamentos.map((a,i) => {
      a.sequencia = i+1;
      return a;
    });
  }

  calculaTotal(){
    
    let totalString: string = '00:00';
    let total: moment.Duration = moment.duration('00:00');
    // Gera os períodos
    for(let i = 0; i < this.timesheet.apontamentos.length; i++){
      if((i+1) <= (this.timesheet.apontamentos.length -1)){
        let d1 = moment(new Date(this.timesheet.apontamentos[i].hora));
        let d2 = moment(new Date(this.timesheet.apontamentos[i+1].hora));
        let periodo = moment.duration(d2.format('HH:mm')).subtract(moment.duration(d1.format('HH:mm')));
        total = moment.duration(total).add(moment.duration(periodo));
        i++;
      }
    }

    totalString = moment.utc(total.as('milliseconds')).format('HH:mm');
    
    return totalString;
  }

  async atividadesLostFocus(){
    if(this.tmsForm.value.observacao){
      this.timesheet.observacao = this.tmsForm.value.observacao;
      if(this.tmsForm.value.cliente){
        await this.salvar(2);
      }
    }
  }

  jaApontou(hora: moment.Moment): boolean{
    let jaApontou = false;
    let pesquisa = this.timesheet.apontamentos.filter(a => {
      let horaJaApontada = moment(a.hora).format('HH:mm');
      return horaJaApontada === hora.format('HH:mm');
    });
    if(pesquisa.length > 0){
      jaApontou = true;
    }
    return jaApontou;
  }

}
