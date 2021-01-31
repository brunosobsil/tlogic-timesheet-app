import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  dataAtual: moment.Moment = moment(new Date());

  constructor() {
    
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

}
