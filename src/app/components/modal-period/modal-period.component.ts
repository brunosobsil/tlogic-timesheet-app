import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-period',
  templateUrl: './modal-period.component.html',
  styleUrls: ['./modal-period.component.scss'],
})
export class ModalPeriodComponent implements OnInit {

  dataInicial: Date = new Date();
  dataFinal: Date = new Date();

  constructor(private modal: ModalController) {}

  ngOnInit() {}

  Gerar(){}
  Cancelar(){
    this.modal.dismiss();
  }

}
