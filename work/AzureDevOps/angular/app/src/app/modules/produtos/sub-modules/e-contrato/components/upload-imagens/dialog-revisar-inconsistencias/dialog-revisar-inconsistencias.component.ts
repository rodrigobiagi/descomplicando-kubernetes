import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ImagemRevisaoContrato } from '../../../core/models/upload-imagens/imagem-revisao-contrato.model';
import { DialogCustomService } from '../../../services/dialog-custom.service';

@Component({
  selector: 'app-dialog-revisar-inconsistencias',
  templateUrl: './dialog-revisar-inconsistencias.component.html',
  styleUrls: ['./dialog-revisar-inconsistencias.component.scss']
})
export class DialogRevisarInconsistenciasComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogService: DialogCustomService,
    private formBuilder: FormBuilder) { }

  displayedColumns: string[] = [
    'radio',
    'numeroContrato',
    'numeroRestricao',
    'documentoDevedor',
    'operacao'
  ];

  contratos: ImagemRevisaoContrato[] = [];

  dataSource = new MatTableDataSource(this.contratos);
  contratosForm = this.formBuilder.group({ contrato: [null] });

  ngOnInit(): void {
    if (this.data) {
      this.contratos = this.data.contratos;
      this.dataSource = new MatTableDataSource(this.contratos);
    }

    this.dialogService.setDialogData('nodata');
    this.contratosForm.valueChanges.subscribe(value => {
      this.dialogService.setDialogData({ dataType: 'revisar-inconsistencias', data: value });
    })
  }
}
