import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Cliente } from '../interfaces/cliente-interface';
import { ClienteService } from '../services/cliente-service';
import { ModalController } from '@ionic/angular';
import { ModalSelectComponent } from '../components/modal-select/modal-select.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

  dataAtual: moment.Moment = moment(new Date());
  listaClientes: Cliente[];
  tmsForm: FormGroup;

  constructor(public clienteSvc: ClienteService,
              public modalController: ModalController) {
    
    this.tmsForm = new FormGroup({
      observacao: new FormControl('', Validators.required),
      cliente: new FormControl('', Validators.required),
    })
    
  }

  async ngOnInit(){
    
    let clienteObservable: Observable<Cliente[]> = await this.clienteSvc.getClientes();
    clienteObservable.subscribe(data => {
      this.listaClientes = data;
    });

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

}
