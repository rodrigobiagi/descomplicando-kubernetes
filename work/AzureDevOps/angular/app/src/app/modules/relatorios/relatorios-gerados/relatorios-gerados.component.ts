import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { showPreloader, closePreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { DialogCustomService } from '../../produtos/sub-modules/e-contrato/services/dialog-custom.service';
import { DialogInformacoesComponent } from '../components/dialog-informacoes/dialog-informacoes.component';
import { DialogSolicitarRelatorioComponent } from '../components/dialog-solicitar-relatorio/dialog-solicitar-relatorio.component';
import { RelatoriosService } from '../services/relatorios.service';

@Component({
  selector: 'app-relatorios-gerados',
  templateUrl: './relatorios-gerados.component.html',
  styleUrls: ['./relatorios-gerados.component.scss']
})
export class RelatoriosGeradosComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogCustomService,
    private relatoriosService: RelatoriosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>
    ) { }

  childstate: boolean = false;
  refreshGrid: boolean = false;
  init: boolean = false;

  solicitacao;
  existemRelatorios: boolean = false;

  ngOnInit(): void {
    this.checkRelatorioProcessando();
  }

  openDialogInformacoes() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogInformacoesComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Entendi',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar'
        },
        disableSaveWithoutData: true
      },
    });
  }

  openDialogSolicitarRelatorio() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '550px',
      data: {
        component: DialogSolicitarRelatorioComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Solicitar'
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.beforeClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.dialogService.dialogData$.subscribe(val => {
          if(val == 'nodata') {
            return;
          }
          this.checkRelatorioProcessando();
          this.submitRelatorio(val);
          this.refreshGrid = !this.refreshGrid;
        });

      }
    });

  }

  submitRelatorio(solicitacao) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.relatoriosService.solicitarRelatorio(solicitacao)
        .toPromise().then((result) => {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }
          this.refreshGrid = !this.refreshGrid;
          this.checkRelatorioProcessando();
          this.store.dispatch(closePreloader())
          this.notifierService.showNotification(
            'Solicitação do relatório realizada com sucesso, por favor, aguarde o processamento.',
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader())
        }).catch(result => {
          this.notifierService.showNotification(result.message, result.status, 'error');
          this.store.dispatch(closePreloader())
        }
        );

  }


  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  checkRelatorioProcessando() {
    this.relatoriosService.validarRelatoriosProcessando().subscribe(result => {
      this.existemRelatorios = result.existemRelatorios;
    })

  }

}
