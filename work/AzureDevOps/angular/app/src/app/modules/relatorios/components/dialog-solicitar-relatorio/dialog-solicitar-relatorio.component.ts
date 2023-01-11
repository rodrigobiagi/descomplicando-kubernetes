import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DominioResponse } from 'src/app/modules/produtos/sub-modules/e-contrato/core/responses/dominios/dominio.response';
import { DialogCustomService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/dialog-custom.service';
import { DominioService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/dominio.service';
import { SolicitarRelatorioRequest } from '../../core/requests/solicitar-relatorio.request';

@Component({
  selector: 'app-dialog-solicitar-relatorio',
  templateUrl: './dialog-solicitar-relatorio.component.html',
  styleUrls: ['./dialog-solicitar-relatorio.component.scss']
})
export class DialogSolicitarRelatorioComponent implements OnInit {

  constructor(
    private dialogService: DialogCustomService,
    private fb: FormBuilder,
    private dominioService: DominioService
    ) { }

  formulario = this.fb.group({
    modeloRelatorio: [{value: ''}, Validators.required],
    periodo: ['', Validators.required],
    dataInicial: [{value: '', disabled: true}, Validators.required],
    dataFinal: [ {value: '', disabled: true}, Validators.required,],
  });

  dataInicial;
  dataFinal;
  modelos = [];

  ngOnInit(): void {
    this.dialogService.setDialogData('nodata');
    this.carregarModelos();
    this.onPeriodoChange();

    this.formulario.get('dataInicial').valueChanges.subscribe(value => {
      if (value) {
        this.dataInicial = value;
      }
    })

    this.formulario.get('dataFinal').valueChanges.subscribe(value => {
      if (value) {
        this.dataFinal = value;
      }
    })

    this.formulario.get('periodo').valueChanges.subscribe(value => {
      if(value == 1) {
        this.dataInicial = this.daysPrior(1);
        this.dataFinal = new Date();

      } else if(value == 2) {
        this.dataInicial = this.daysPrior(15);
        this.dataFinal = new Date();
      }
    });

    this.formulario.valueChanges.subscribe(value => {
      if(this.formulario.valid) {
        let nome = this.modelos.filter(m => m.id == value.modeloRelatorio)[0].valor;

        if(this.dataFinal && this.dataInicial) {
          let solicitacao = <SolicitarRelatorioRequest>{
            nome: nome,
            dominioId: this.formulario.get('modeloRelatorio').value,
            periodo: this.formulario.get('periodo').value,
            dataInicial: new Date(this.dataInicial).toISOString(),
            dataFinal:  new Date(this.dataFinal).toISOString(),
          };
          this.dialogService.setDialogData(solicitacao);
        }
      } else {
        this.dialogService.setDialogData('nodata')
      }
    })
  }

getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()

addMonths = (input, months) => {
  if(input) {
    const date = new Date(input);
    date.setDate(1)
    date.setMonth(date.getMonth() + months)
    date.setDate(Math.min(input.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth()+1)))
    return date
  }
}

daysPrior(days) {
  const input = new Date();
  let date = new Date();
  date.setDate(input.getDate() - days);
  this.formulario.get('dataFinal').setValue(input);
  this.formulario.get('dataInicial').setValue(date);
  return(date);
}

  getRelatorioName(id) {
    let relatorioName = this.modelos.filter(m => m.id == id);
    return relatorioName[0].valor;
  }

  onPeriodoChange() {
    this.formulario.get('periodo').valueChanges.subscribe(value => {
      if(value == 3) {
        this.formulario.get('dataInicial').enable();
        this.formulario.get('dataFinal').enable();
      } else {
        this.formulario.get('dataInicial').disable();
        this.formulario.get('dataFinal').disable();
      }
    })
  }

  private carregarModelos() {
    this.dominioService.obterPorTipo('SOLICITACAO_RELATORIO')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          this.modelos = response.valorDominio;
          this.formulario.get('modeloRelatorio').setValue(this.modelos[0].id)
        }
      })
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
