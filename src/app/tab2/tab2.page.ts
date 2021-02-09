import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPeriodComponent } from '../components/modal-period/modal-period.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private modalController: ModalController) {}

  async parametros(){
    const modal = await this.modalController.create({
      component: ModalPeriodComponent,
      cssClass: 'modal-period',
      backdropDismiss: true
    });
    modal.present();
  }

}
