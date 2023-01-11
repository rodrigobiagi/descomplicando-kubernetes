import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RevisaoRegistro } from '../../core/models/revisao-registros/revisao-registro';
import { RevisaoRegistroField } from '../../core/models/revisao-registros/revisao-registro-field';

@Component({
  selector: 'app-dialog-detalhe-erro-revisao',
  templateUrl: './dialog-detalhe-erro-revisao.component.html',
  styleUrls: ['./dialog-detalhe-erro-revisao.component.scss']
})
export class DialogDetalheErroRevisaoComponent implements OnInit {

  totalInconsistencia: number = 0;
  inconsistenciasDadosFinanciamento: RevisaoRegistroField[] = [];
  inconsistenciasDadosContrato: RevisaoRegistroField[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { revisaoRegistro: RevisaoRegistro }) { }

  ngOnInit(): void {
    this.limparInconsistencias();
    this.carregarInconsistencias();
  }

  private carregarInconsistencias() {

    this.data.revisaoRegistro.dadosFinanciamento.forEach((fields: RevisaoRegistroField) => {

      if (fields.possuiErro) {
        this.inconsistenciasDadosFinanciamento.push(fields);
        this.totalInconsistencia += 1;
      }

    })

    this.data.revisaoRegistro.dadosContrato.forEach((fields: RevisaoRegistroField) => {

      if (fields.possuiErro) {
        this.inconsistenciasDadosContrato.push(fields);
        this.totalInconsistencia += 1;
      }
    })
  }

  private limparInconsistencias() {
    this.inconsistenciasDadosFinanciamento = [];
    this.inconsistenciasDadosContrato = [];
    this.totalInconsistencia = 0;
  }

}
