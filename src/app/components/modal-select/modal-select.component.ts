import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-select',
  templateUrl: './modal-select.component.html',
  styleUrls: ['./modal-select.component.scss'],
})
export class ModalSelectComponent implements OnInit {

  @Input() lista: any[];
  @Input() titulo: string;
  listaFull: any[];

  constructor(private modalController: ModalController) {
   }

  ngOnInit() {
    this.listaFull = this.lista;
  }

  onSearch(find: string){
    if(find){
      find = find.toLowerCase();
      this.lista = this.lista.filter((l) => {
        
        let codigo:string = l.codigo;
        let descricao:string = l.descricao;      
        codigo = codigo.toLowerCase();
        descricao = descricao.toLowerCase();

        return codigo.includes(find) || descricao.includes(find);
      });
    }else{
      this.lista = this.listaFull;
    }
    
  }

  async onSelect(selecionado){
    await this.modalController.dismiss(selecionado);
  }

}
