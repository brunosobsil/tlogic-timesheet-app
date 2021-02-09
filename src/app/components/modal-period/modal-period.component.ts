import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-modal-period',
  templateUrl: './modal-period.component.html',
  styleUrls: ['./modal-period.component.scss'],
})
export class ModalPeriodComponent implements OnInit {

  dataInicial: Date = new Date();
  dataFinal: Date = new Date();

  constructor(private modal: ModalController, private alertController: AlertController) {}

  ngOnInit() {}

  Gerar(){
    if(this.dataFinal < this.dataInicial){
      this.exibeAlerta('Data final não pode ser menor que a data inicial!');
    }else{
      this.modal.dismiss({dataInicial: this.dataInicial, dataFinal: this.dataFinal});
    }
  }
  Cancelar(){
    this.modal.dismiss();
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
