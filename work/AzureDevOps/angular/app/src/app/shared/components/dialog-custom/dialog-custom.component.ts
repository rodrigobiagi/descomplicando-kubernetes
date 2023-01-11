import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomService } from '../../../modules/produtos/sub-modules/e-contrato/services/dialog-custom.service';

@Component({
  selector: 'app-dialog-custom',
  templateUrl: './dialog-custom.component.html',
  styleUrls: ['./dialog-custom.component.scss']
})
export class DialogCustomComponent implements OnInit {

  @ViewChild('target', { read: ViewContainerRef, static: true }) vcRef: ViewContainerRef;

  componentRef: ComponentRef<any>;
  disableSave: boolean = false;
  disableBtns: boolean = false;

  constructor(
    private resolver: ComponentFactoryResolver,
    private dialogService: DialogCustomService,
    private _ref: ChangeDetectorRef,

    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    const factory = this.resolver.resolveComponentFactory(this.data.component);
    this.componentRef = this.vcRef.createComponent(factory);

    /**
     * Se essa opção estiver marcada, o botão de confirmação não aparece enquanto o DialogData não estiver válido
     */
    if (this.data.disableSaveWithoutData) {
      this.dialogService.dialogData$.subscribe(value => {
        this.disableSave = value == 'nodata';
        this._ref.detectChanges();
      });
    }

    if (this.data.buttonCustom) {
      if (this.data.buttonCustom.showBtn) { this.disableBtns = !this.data.buttonCustom.showOthers; }
    }
  }
  
  getFormatacao(message: string) {
    document.getElementById('modal-title').innerHTML = message;
    return '';
  }
  
  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
