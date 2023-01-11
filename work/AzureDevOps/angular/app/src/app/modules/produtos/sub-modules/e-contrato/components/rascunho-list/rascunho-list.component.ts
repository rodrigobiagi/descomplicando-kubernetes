import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoFormulario } from '../../core/enums/tipo-formulario.enum';
import { RascunhoResumo } from '../../core/models/rascunhos/rascunho-resumo.model';
import { ObterRascunhoResumoPaginationResponse } from '../../core/responses/rascunhos/obter-rascunho-resumo-pagination.response';
import { RascunhoService } from '../../services/rascunho.service';
import { DialogCommonComponent } from '../dialog-common/dialog-common.component';
import { DialogCommon } from '../../core/models/common/dialog.model';

import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { ContratoService } from '../../services/contrato.service';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-rascunho-list',
  templateUrl: './rascunho-list.component.html',
  styleUrls: ['./rascunho-list.component.scss']
})

export class RascunhoListComponent implements OnInit, OnDestroy, AfterViewInit {

  dataDialog: DialogCommon;

  items: RascunhoResumo[];

  permissoesFlag1: Permissao;
  permissoesFlag2: Permissao;
  permissoesFlag3: Permissao;
  permissoesFlag4: Permissao;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private contratoService: ContratoService
  ) { }

  ngOnInit(): void {
    this.verifyPermission();
    this.obterRascunhosInicio();
  }


  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesFlag1 = this.getPermissaoMasterDefault();
      this.permissoesFlag2 = this.getPermissaoMasterDefault();
      this.permissoesFlag3 = this.getPermissaoMasterDefault();
      this.permissoesFlag4 = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];

    this.permissoesFlag1 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_REGISTRAR_CONTRATO'))[0];
    this.permissoesFlag2 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_ALTERAR_CONTRATO'))[0];
    this.permissoesFlag3 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_REGISTRAR_ADITIVO'))[0];
    this.permissoesFlag4 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_ALTERAR_ADITIVO'))[0];
  }

  async obterRascunhosInicio() {
    this.items = await (await this.obterRascunhos(0, 5).toPromise()).rascunhos;
  }

  obterRascunhos(pageIndex: number, pageSize: number): Observable<ObterRascunhoResumoPaginationResponse> {
    return this.rascunhoService.obterRascunhosResumo(pageIndex, pageSize);
  }

  editarRascunho(identifier: string) {
    this.contratoService.retornoContrato(undefined);
    this.rascunhoService.obterRascunho(identifier).subscribe(rascunho => {
      if (rascunho.operacaoId == 1) {
        if (!this.permissoesFlag1.editar) { return; }
      }

      let tipoFormulario: TipoFormulario;

      if (rascunho.tipoFormulario == 1) {
        tipoFormulario = TipoFormulario.ONEPAGE
      } else {
        tipoFormulario = TipoFormulario.STEPPER
      }

      var rota = rascunho.operacaoId == TipoOperacao.RegistrarContrato ? 'registrar-contrato' : (rascunho.operacaoId == TipoOperacao.AlterarContrato ? 'alterar-contrato' : (rascunho.operacaoId == TipoOperacao.RegistrarAditivo ? 'registrar-aditivo' : 'alterar-aditivo'))
      this.router.navigate([`/produtos/e-contrato/registro-contrato/${rota}/`, identifier],
        { queryParams: { form: tipoFormulario, mode: 'edit', uf: rascunho.contrato.ufLicenciamento } });

      this.contratoService.retornoProtocolo(rascunho.protocoloOrigem);
    })
  }

  excluirRascunho(identifier: string, operacaoId: number) {
    if (operacaoId == 1) {
      if (!this.permissoesFlag1.editar) { return; }
    }
    if (operacaoId == 2) {
      if (!this.permissoesFlag2.editar) { return; }
    }
    if (operacaoId == 3) {
      if (!this.permissoesFlag3.editar) { return; }
    }
    if (operacaoId == 4) {
      if (!this.permissoesFlag4.editar) { return; }
    }

    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: 'Excluir Rascunho',
        text: 'Deseja realmente excluir o rascunho?',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Sim, desejo excluir o rascunho'
        }
      }
    })

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.rascunhoService.excluirRascunho(identifier).subscribe(data => {
          if (data) {
            this.obterRascunhosInicio();
            this.notifierService.showNotification('Rascunho excluido com sucesso', 'Rascunho excluido', 'success');
          }
        }, error => {
          this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error')
          console.info(error)
        });
      }
    })
  }

  excluirRascunhos(identifierList: Array<string>) {
    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: identifierList.length > 1 ? 'Excluir Rascunhos' : 'Excluir Rascunho',
        text: identifierList.length > 1 ? 'Deseja realmente excluir os rascunhos?' : 'Deseja realmente excluir o rascunho?',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: identifierList.length > 1 ? 'Sim, desejo excluir os rascunhos' : 'Sim, desejo excluir o rascunho'
        }
      }
    })

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.rascunhoService.excluirRascunhos(identifierList).subscribe(data => {
          if (data) {
            this.obterRascunhosInicio();
            this.notifierService.showNotification('Rascunhos excluídos com sucesso', 'Rascunhos excluídos', 'success');
          }
        }, error => {
          this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error')
          console.info(error)
        });
      }
    })
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void { }

  verificaPermissaoExclusao(operacaoId: number) {
    if (operacaoId == 1 && !this.permissoesFlag1.editar) return false;

    return true;
  }
  allowEdit: boolean;

  checkEdit(operacao) {

    if (operacao == 1) {
      this.allowEdit = (!this.permissoesFlag1.editar)
      return this.allowEdit;
    }

    if (operacao == 2) {
      this.allowEdit = (!this.permissoesFlag2.editar)
      return this.allowEdit;
    }

    if (operacao == 3) {
      this.allowEdit = (!this.permissoesFlag3.editar)
      return this.allowEdit;
    }

    if (operacao == 4) {
      this.allowEdit = (!this.permissoesFlag4.editar)
      return this.allowEdit;
    }
  }

  onClickGerenciarRascunhos() {
    this.dialog.open(DialogCommonComponent, {
      width: '440px',
      data: {
        title: 'Em breve você poderá acessar esta área.',
        text: 'Agradecemos o interesse, esta área não está disponível no momento. Te avisaremos quando estiver pronta.',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Entendi'
        },
        disableCancelBtn: true
      }
    });
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  private getPermissaoMasterDefault(): Permissao {
    return <Permissao>{
      id: 0,
      palavraChave: "",
      nome: '',
      admin: true,
      consultar: true,
      editar: true
    };
  }
}
