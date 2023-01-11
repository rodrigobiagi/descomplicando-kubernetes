import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-dialog-enviar-registro',
  templateUrl: './dialog-enviar-registro.component.html',
  styleUrls: ['./dialog-enviar-registro.component.scss']
})
export class DialogEnviarRegistroComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

}
