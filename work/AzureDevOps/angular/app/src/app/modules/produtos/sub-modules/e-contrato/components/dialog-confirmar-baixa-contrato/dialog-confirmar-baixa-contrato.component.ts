import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogCustomService } from '../../services/dialog-custom.service';

@Component({
  selector: 'app-dialog-confirmar-baixa-contrato',
  templateUrl: './dialog-confirmar-baixa-contrato.component.html',
  styleUrls: ['./dialog-confirmar-baixa-contrato.component.scss']
})
export class DialogConfirmarBaixaContratoComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {type: string}) { }

  ngOnInit(): void {
    console.log(this.data.type);

  }

}
