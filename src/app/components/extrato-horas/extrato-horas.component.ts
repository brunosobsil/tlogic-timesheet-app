import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-extrato-horas',
  templateUrl: './extrato-horas.component.html',
  styleUrls: ['./extrato-horas.component.scss'],
})
export class ExtratoHorasComponent implements OnInit {

  @Input() extrato: any;

  constructor() { }

  ngOnInit() {}

  getData(data: string){
    const dataFormatada: string = moment(data).format('DD/MM/YYYY');
    return dataFormatada;
  }

  getHorasDia(data:string, horas_dia: any){
    let d = moment(data);
    d = d.set(horas_dia);
    return d.format('HH:mm');
  }

  getTotalHoras(horas_periodo:any){
    let totalString:string = '';
    
    if(horas_periodo.hours)
      totalString += horas_periodo.hours + ':';
    else
      totalString += '00:';

    if(horas_periodo.minutes)
      totalString += String(horas_periodo.minutes).padStart(2,'0');
    else
      totalString += '00';
    
    return totalString;
  }

}
