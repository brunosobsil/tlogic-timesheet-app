import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPeriodComponent } from '../components/modal-period/modal-period.component';
import { ExtratoHorasComponent } from '../components/extrato-horas/extrato-horas.component';
import { UsuarioService } from '../services/usuario-service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private modalController: ModalController, 
              private usuarioSvc: UsuarioService,
              private loadingController: LoadingController) {}

  async parametros(){
    
    const modal = await this.modalController.create({
      component: ModalPeriodComponent,
      cssClass: 'modal-period',
      backdropDismiss: true
    });
    modal.onDidDismiss().then(async (data: any) =>{
      if(data && data.data){
        const dataInicial:Date = data.data.dataInicial;
        const dataFinal:Date = data.data.dataFinal;
        const loading = await this.loadingController.create({
          message: 'Processando...',
        });
        loading.present();
        const extrato = await this.usuarioSvc.extratoHoras(dataInicial, dataFinal);
        extrato.subscribe(async extrato => {
          const modalExtrato = await this.modalController.create({
            component: ExtratoHorasComponent,
            componentProps: {
              extrato: extrato
            }
          });
          await loading.dismiss();
          await modalExtrato.present();
        });
      }
    });  
    modal.present();
    
  }

}
