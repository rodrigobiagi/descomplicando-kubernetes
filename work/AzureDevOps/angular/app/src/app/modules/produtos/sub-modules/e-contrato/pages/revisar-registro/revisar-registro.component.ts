import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ViewportScroller } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DialogSimpleService } from 'src/app/shared/components/dialog-simple/dialog-simple.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { DialogEnviarRegistroComponent } from '../../components/dialog-enviar-registro/dialog-enviar-registro.component';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { MapperConfigurationEContrato } from '../../core/mappers/mapper-configuration.mapper';
import { Rascunho } from '../../core/models/rascunhos/rascunho.model';
import { RevisaoRegistroField } from '../../core/models/revisao-registros/revisao-registro-field';
import { AlterarAditivoRequest } from '../../core/requests/aditivos/alterar-aditivo.request';
import { AlterarContratoRequest } from '../../core/requests/contratos/alterar-contrato.request';
import { RegistrarContratoRequest } from '../../core/requests/contratos/registrar-contrato.request';
import { RegistrarAditivoRequest } from '../../core/requests/contratos/registrar-aditivo.request';
import { AlterarContratoResponse } from '../../core/responses/contratos/alterar-contrato.response';
import { RegistrarContratoResponse } from '../../core/responses/contratos/registrar-contrato.response';
import { RegistrarAditivoResponse } from '../../core/responses/contratos/registrar-aditivo.response';
import { AditivoService } from '../../services/aditivo.service';
import { ContratoService } from '../../services/contrato.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AlterarAditivoResponse } from '../../core/responses/aditivos/alterar-aditivo.response';
import { DadosRevisaoRascunho } from '../../core/models/rascunhos/dados-revisao-rascunho.model';
import { TipoFormulario } from '../../core/enums/tipo-formulario.enum';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-revisar-registro',
  templateUrl: './revisar-registro.component.html',
  styleUrls: ['./revisar-registro.component.scss']
})
export class RevisarRegistroComponent implements OnInit {

  identifier: string;
  panelOpenState = false;
  formSubmitted: boolean = false;
  rascunho: Rascunho = new Rascunho();
  revisaoRascunhoVeiculo: DadosRevisaoRascunho[] = [];
  tipoFormulario: TipoFormulario;
  operacaoId: number;
  urlOperacao: string;
  uf: string;
  qtdVeiculos: number = null;

  habilitaBotao: boolean = false;

  @Output() editarEtapa: EventEmitter<number> = new EventEmitter<number>();

  constructor(public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    private viewportScroller: ViewportScroller,
    private router: Router,
    private dialogSimple: DialogSimpleService,
    private rascunhoService: RascunhoService,
    private contratoService: ContratoService,
    private aditivoService: AditivoService) {
    this.identifier = this.activeRoute.snapshot.params['identifier'];
    this.activeRoute.queryParams.subscribe(params => {
      this.uf = params.uf
      if (!params.form) { this.habilitaBotao = true; }
    });
  }

  ngOnInit(): void {
    this.rascunhoService.obterRascunho(this.identifier)
      .subscribe((response) => {

        if (response.isSuccessful) {
          this.rascunho.veiculo = response.veiculo;
          this.rascunho.contrato = response.contrato;
          this.rascunho.complementar = response.complementar;
          this.rascunho.credor = response.credor;
          this.rascunho.devedor = response.devedor;
          this.rascunho.financiamento = response.financiamento;
          this.tipoFormulario = response.tipoFormulario == 1 ? TipoFormulario.ONEPAGE : TipoFormulario.STEPPER;
          this.operacaoId = response.operacaoId;
          this.urlOperacao = this.operacaoId == TipoOperacao.RegistrarContrato ? 'registrar-contrato' : (this.operacaoId == TipoOperacao.AlterarContrato ? 'alterar-contrato' : (this.operacaoId == TipoOperacao.RegistrarAditivo ? 'registrar-aditivo' : 'alterar-aditivo'))
          this.uf = response.ufLicenciamento
        }

        this.store.dispatch(closePreloader());
      })
  }

  public enviarRegistro(): void {
    const dialogRef = this.dialog.open(DialogEnviarRegistroComponent, {
      scrollStrategy: new NoopScrollStrategy()
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.formSubmitted = true;
        this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));

        switch (this.operacaoId) {
          case TipoOperacao.RegistrarContrato:
            this.registrarContrato();
            break;
          case TipoOperacao.AlterarContrato:
            this.alterarContrato();
            break;
          case TipoOperacao.RegistrarAditivo:
            this.registrarAditivo();
            break;
          case TipoOperacao.AlterarAditivo:
            this.alterarAditivo();
            break;
          default:
            console.log('Something Wrong')
            break;
        }
      }
    })
  }

  public anchorScroll(elementId: string): void {

    this.viewportScroller.scrollToAnchor(elementId);
  }

  public registroErro(revisaoRegistroField: RevisaoRegistroField[]) {
    if (revisaoRegistroField.findIndex(a => a.possuiErro) >= 0) { return true; }
    return false;
  }

  private registrarContrato(): void {
    let request = new RegistrarContratoRequest();

    request = MapperConfigurationEContrato.toRegistrarContratoRequest(this.rascunho);

    this.contratoService.registrarContrato(request)
      .subscribe((response: RegistrarContratoResponse) => {

        this.formSubmitted = false;
        this.store.dispatch(closePreloader());

        if (response.isSuccessful) {
          this.rascunhoService.excluirRascunho(this.identifier).subscribe(data => {
            if (data) {
              this.router.navigate(['/produtos/e-contrato']);

              let dialog = this.dialogSimple.showDialog('Contrato enviado com sucesso!', 'Registrar outro contrato', '', 'success');

              dialog.afterClosed().subscribe(confirmacao => {
                if (confirmacao) {
                  this.router.navigate(['/produtos/e-contrato/registro-contrato']);
                }
              })
            }
          })
        } else {

          //TODO: Adicionar um alerta de erro
          //this.adicionarInconsistencias(response.errors);
          this.viewportScroller.scrollToPosition([0, 0])
        }
      }, (error) => {

        this.store.dispatch(closePreloader());
        this.formSubmitted = false;
        this.viewportScroller.scrollToPosition([0, 0])

      });
  }

  private alterarContrato(): void {
    let request = new AlterarContratoRequest();

    request = MapperConfigurationEContrato.toAlterarContratoRequest(this.rascunho);

    this.contratoService.alterarContrato(request)
      .subscribe((response: AlterarContratoResponse) => {
        this.formSubmitted = false;
        this.store.dispatch(closePreloader());

        if (response.isSuccessful) {
          this.rascunhoService.excluirRascunho(this.identifier).subscribe(data => {
            if (data) {
              this.router.navigate(['/produtos/e-contrato']);

              let dialog = this.dialogSimple.showDialog('Contrato enviado com sucesso!', 'Alterar outro contrato', '', 'success');

              dialog.afterClosed().subscribe(confirmacao => {
                if (confirmacao) {
                  this.router.navigate(['/produtos/e-contrato/registro-contrato']);
                }
              })
            }
          });
        } else {

          //TODO: Adicionar um alerta de erro
          //this.adicionarInconsistencias(response.errors);
          this.viewportScroller.scrollToPosition([0, 0])
        }
      }, () => {
        this.store.dispatch(closePreloader());
        this.formSubmitted = false;
        this.viewportScroller.scrollToPosition([0, 0])
      });
  }

  private alterarAditivo(): void {
    let request = new AlterarAditivoRequest();

    request = MapperConfigurationEContrato.toAlterarAditivoRequest(this.rascunho);

    this.aditivoService.alterarAditivo(request)
      .subscribe((response: AlterarAditivoResponse) => {
        this.formSubmitted = false;
        this.store.dispatch(closePreloader());

        if (response.isSuccessful) {
          this.rascunhoService.excluirRascunho(this.identifier).subscribe(data => {
            if (data) {
              this.router.navigate(['/produtos/e-contrato']);

              let dialog = this.dialogSimple.showDialog('Aditivo enviado com sucesso!', 'Alterar outro aditivo', '', 'success');

              dialog.afterClosed().subscribe(confirmacao => {
                if (confirmacao) { this.router.navigate(['/produtos/e-contrato/registro-contrato']); }
              });
            }
          })
        }
        else {
          //TODO: Adicionar um alerta de erro
          //this.adicionarInconsistencias(response.errors);
          this.viewportScroller.scrollToPosition([0, 0])
        }
      }, () => {
        this.store.dispatch(closePreloader());
        this.formSubmitted = false;
        this.viewportScroller.scrollToPosition([0, 0])
      });
  }

  private registrarAditivo(): void {
    let request = new RegistrarAditivoRequest();

    request = MapperConfigurationEContrato.toRegistrarAditivoRequest(this.rascunho);

    this.aditivoService.registrarAditivo(request)
      .subscribe((response: RegistrarAditivoResponse) => {

        this.formSubmitted = false;
        this.store.dispatch(closePreloader());

        if (response.isSuccessful) {
          this.rascunhoService.excluirRascunho(this.identifier).subscribe(data => {
            if (data) {
              this.router.navigate(['/produtos/e-contrato']);
              let dialog = this.dialogSimple.showDialog('Aditivo adicionado com sucesso!', 'Registrar outro contrato', '', 'success');

              dialog.afterClosed().subscribe(confirmacao => {
                if (confirmacao) {
                  this.router.navigate(['/produtos/e-contrato/registro-contrato']);
                }
              })
            }
          });
        }
        else {
          //TODO: Adicionar um alerta de erro
          //this.adicionarInconsistencias(response.errors);
          this.viewportScroller.scrollToPosition([0, 0])
        }
      },
        (error) => {
          console.info(error)
          this.store.dispatch(closePreloader())
          this.formSubmitted = false
          this.viewportScroller.scrollToPosition([0, 0])
        });
  }

  public setQuantidadeVeiculos(quantidade: number) {
    this.qtdVeiculos = quantidade;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  onEditarEtapa(etapa: number) {
    this.editarEtapa.emit(etapa);
  }
}
