import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

import { DialogCommon } from '../../core/models/common/dialog.model';

@Component({
  selector: 'app-dialog-common',
  templateUrl: './dialog-common.component.html',
  styleUrls: ['./dialog-common.component.scss']
})
export class DialogCommonComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogCommon) { }

  disableCancelBtn: boolean = false;

  ngOnInit(): void {
    if (this.data.disableCancelBtn) { this.disableCancelBtn = this.data.disableCancelBtn; }
  }
  
  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
