import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { ExcelService } from '../../services/excel-service';

@Component({
  selector: 'app-extrato-horas',
  templateUrl: './extrato-horas.component.html',
  styleUrls: ['./extrato-horas.component.scss'],
})
export class ExtratoHorasComponent implements OnInit {

  @Input() extrato: any;

  constructor(private modal: ModalController, private excelSvc: ExcelService) { }

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

  getTotalValor(valor){
    return valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
  }

  fechar(){
    this.modal.dismiss();
  }

  async exportarExcel(){
    let dados = this.extrato.map(e => {
      let linha = {
        data: this.getData(e.data),
        cliente: 'Enauta Energia S/a',
        horas: this.getHorasDia(e.data, e.horas_dia)
      };
      return linha;
    });
    dados.push({data: '', cliente: 'Total horas', horas: this.getTotalHoras(this.extrato[0].horas_periodo)});
    dados.push({data: '', cliente: 'Total valor', horas: this.getTotalValor(this.extrato[0].total_receber)});

    await this.excelSvc.exportToExcel(dados,'extrato');
  }

}
