import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';

import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { TipoFormulario } from '../../core/enums/tipo-formulario.enum';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { TipoStatusTransacao } from '../../core/enums/tipo-status-transacao.enum';
import { Detran } from '../../core/models/detrans/detran.model';
import { EmpresasAF } from '../../core/models/empresas/empresasAF.model';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';
import { ConsultarContratoRequest } from '../../core/requests/contratos/consultar-contrato.request';
import { CriarRascunhoResumoRequest } from '../../core/requests/rascunhos/criar-rascunho-resumo.request';
import { CriarRascunhoResumoResponse } from '../../core/responses/rascunhos/criar-rascunho-resumo.response';
import { ContratoService } from '../../services/contrato.service';
import { DialogCustomService } from '../../services/dialog-custom.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { BackofficeService } from '../../services/_backoffice/_backoffice.service';
import { DialogFormInfoComponent } from '../dialog-form-info/dialog-form-info.component';
import { TransacaoNegadaAlertComponent } from '../transacao-negada-alert/transacao-negada-alert.component';

@Component({
  selector: 'app-criar-rascunho-resumo',
  templateUrl: './criar-rascunho-resumo.component.html',
  styleUrls: ['./criar-rascunho-resumo.component.scss']
})
export class CriarRascunhoResumoComponent implements OnInit {

  formulario: FormGroup;
  novoRascunho: CriarRascunhoResumoRequest = new CriarRascunhoResumoRequest();
  formSubmitted: boolean = false;
  ufsLicenciamento: Detran[];
  usuarioGuid: string;
  empresas: EmpresasAF[];
  sortPipe = new SortByPipe();
  allowRegistrarContrato: boolean = true;
  allowAlterarContrato: boolean = true;
  allowRegistrarAditivo: boolean = true;
  allowAlterarAditivo: boolean = true;

  permissoesFlag1: Permissao;
  permissoesFlag2: Permissao;
  permissoesFlag3: Permissao;
  permissoesFlag4: Permissao;

  listaPermissoes = null;
  listaPermissoesConvidado = null;

  @Output() childstate: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogCustomService,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private contratoService: ContratoService,
    private backofficeService: BackofficeService,
    public authService: AuthService,
    private agenteFinanceiroService: AgenteFinanceiroService) { }

  ngOnInit(): void {
    this.listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.listaPermissoesConvidado = JSON.parse(localStorage.getItem('permissionsConvidado')) as PermissoesConvidados[];
    this.verifyPermission();

    this.usuarioGuid = sessionStorage.getItem('userGuid');
    this.initializeForm();

    this.carregarEmpresas();
    this.onChangeEmpresa();
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

    this.permissoesFlag1 = this.listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_REGISTRAR_CONTRATO'))[0];
    this.permissoesFlag2 = this.listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_ALTERAR_CONTRATO'))[0];
    this.permissoesFlag3 = this.listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_REGISTRAR_ADITIVO'))[0];
    this.permissoesFlag4 = this.listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_ALTERAR_ADITIVO'))[0];
  }

  public submit(): void {

    this.formSubmitted = true;
    if (this.formulario.valid) {
      let empresaId = this.formulario.get('empresa').value;
      this.agenteFinanceiroService.retornoEmpresa(empresaId);
      this.contratoService.retornoContrato(undefined);
      let tipoOperacao = this.formulario.get('tipoOperacao').value;

      if ((tipoOperacao == TipoOperacao.RegistrarContrato && this.formulario.controls['registroFrota'].value) || (tipoOperacao != TipoOperacao.RegistrarContrato)) {

        let request = <ConsultarContratoRequest>{
          numeroContrato: this.formulario.get('numeroContrato').value,
          uf: this.formulario.get('ufLicenciamento').value,
          statusTransacao: TipoStatusTransacao.ProcessamentoConcluido,
          tipoOperacao: tipoOperacao
        };

        this.contratoService.consultarContrato(request, empresaId)
          .subscribe(response => {

            if (tipoOperacao == TipoOperacao.RegistrarContrato && this.formulario.controls['registroFrota'].value) {
              this.openDialog();
              this.formSubmitted = false;
              return;
            }

            if (response.isSuccessful) {
              this.criaRascunho(response.result.contrato.protocolo);
              Utility.waitFor(() => { this.contratoService.retornoContrato(response.result); }, 1000)
              return;
            }

            if (tipoOperacao == TipoOperacao.RegistrarAditivo) {
              this.criaRascunho();
              return;
            }
            else {
              this.notifierService.showNotification('Contrato não encontrado', 'Falha', 'error')
              this.formSubmitted = false;
            }
          }, error => {
            if (tipoOperacao == TipoOperacao.RegistrarContrato && this.formulario.controls['registroFrota'].value) {
              this.criaRascunho();
              return;
            }

            if (tipoOperacao == TipoOperacao.RegistrarAditivo) {
              this.criaRascunho();
              return;
            }

            if (tipoOperacao == TipoOperacao.AlterarContrato && this.formulario.get('ufLicenciamento').value == 'PR') {
              this.criaRascunho();
              return;
            }

            this.notifierService.showNotification('Contrato não encontrado', 'Falha interna', 'error')
            this.formSubmitted = false;
          })

        return;
      }

      this.criaRascunho();
    }
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  private carregarUfsLicenciamento() {
    this.authService.obterUsuarioAtual().then(usuario => {
      this.backofficeService.obterDetransPorEmpresaId(this.formulario.controls['empresa'].value).subscribe(ufs => {
        this.ufsLicenciamento = ufs.detrans.filter(detran => detran.ativo);
        this.sortUFs();
      })
    });
  }

  private carregarEmpresas() {
    this.agenteFinanceiroService.obterAgentesFinanceirosPorUsuarioGuid(this.usuarioGuid).subscribe(res => {
      this.empresas = res.empresas;
      if (this.empresas.length == 1) {
        this.formulario.controls['empresa'].setValue(this.empresas[0].id)
        this.formulario.controls['empresa'].disable();
      }
    })
  }

  onChangeEmpresa() {
    this.formulario.controls['empresa'].valueChanges.subscribe((empresa) => {
      if (!empresa) {
        this.formulario.controls['ufLicenciamento'].disable();
        return;
      }

      this.carregarUfsLicenciamento();
      this.verifyPermissionConvidado(empresa);
      this.formulario.get('tipoOperacao').reset();
      this.formulario.controls['ufLicenciamento'].enable();

      return;
    })

    this.formulario.controls['ufLicenciamento'].valueChanges.subscribe((uf) => {
      if (uf) {
        let selectedUF = this.ufsLicenciamento.filter(u => u.ufDetran == uf);

        this.allowRegistrarContrato = selectedUF[0].ehHabilitadaFlag1;
        this.allowAlterarContrato = selectedUF[0].ehHabilitadaFlag2;
        this.allowRegistrarAditivo = selectedUF[0].ehHabilitadaFlag3;
        this.allowAlterarAditivo = selectedUF[0].ehHabilitadaFlag4;

        this.formulario.get('tipoOperacao').reset();
      }
    })

  }

  verifyPermissionConvidado(empresaId: number) {
    if (empresaId == +sessionStorage.getItem('empresaId')) {
      this.permissoesFlag1 = this.getPermissaoEmpresaPrincipal('CONTRATO_REGISTRAR_CONTRATO');
      this.permissoesFlag2 = this.getPermissaoEmpresaPrincipal('CONTRATO_ALTERAR_CONTRATO');
      this.permissoesFlag3 = this.getPermissaoEmpresaPrincipal('CONTRATO_REGISTRAR_ADITIVO');
      this.permissoesFlag4 = this.getPermissaoEmpresaPrincipal('CONTRATO_ALTERAR_ADITIVO');
      return;
    }

    let permissoesConvidadoFlag1 = this.getPermissaoConvidado(empresaId, 'CONTRATO_REGISTRAR_CONTRATO');
    let permissoesConvidadoFlag2 = this.getPermissaoConvidado(empresaId, 'CONTRATO_ALTERAR_CONTRATO');
    let permissoesConvidadoFlag3 = this.getPermissaoConvidado(empresaId, 'CONTRATO_REGISTRAR_ADITIVO');
    let permissoesConvidadoFlag4 = this.getPermissaoConvidado(empresaId, 'CONTRATO_ALTERAR_ADITIVO');

    if (!permissoesConvidadoFlag1) { this.permissoesFlag1 = this.getPermissaoNegadaDefault(); }
    else { this.permissoesFlag1 = permissoesConvidadoFlag1; }
    if (!permissoesConvidadoFlag2) { this.permissoesFlag2 = this.getPermissaoNegadaDefault(); }
    else { this.permissoesFlag2 = permissoesConvidadoFlag2; }
    if (!permissoesConvidadoFlag3) { this.permissoesFlag3 = this.getPermissaoNegadaDefault(); }
    else { this.permissoesFlag3 = permissoesConvidadoFlag3; }
    if (!permissoesConvidadoFlag4) { this.permissoesFlag4 = this.getPermissaoNegadaDefault(); }
    else { this.permissoesFlag4 = permissoesConvidadoFlag4; }
  }

  getPermissaoEmpresaPrincipal(palavraChave: string): Permissao {
    return this.listaPermissoes.filter(permissao => (permissao.palavraChave == palavraChave))[0];
  }

  getPermissaoConvidado(empresaId: number, palavraChave: string): PermissoesConvidados {
    return this.listaPermissoesConvidado.filter(permissao => (permissao.empresaId == empresaId && permissao.palavraChave == palavraChave))[0];
  }

  private getPermissaoNegadaDefault(): Permissao {
    return <Permissao>{
      id: 0,
      palavraChave: "",
      nome: '',
      admin: false,
      consultar: false,
      editar: false
    };
  }

  private criaRascunho(protocolo: string = null) {
    this.criarRascunhoResumo(protocolo);
    this.rascunhoService.criarRascunhoResumo(this.novoRascunho)
      .subscribe((response: CriarRascunhoResumoResponse) => {

        this.formSubmitted = false;
        if (response.isSuccessful) {
          var rota = this.novoRascunho.operacaoId == TipoOperacao.RegistrarContrato ? 'registrar-contrato' : (this.novoRascunho.operacaoId == TipoOperacao.AlterarContrato ? 'alterar-contrato' : (this.novoRascunho.operacaoId == TipoOperacao.RegistrarAditivo ? 'registrar-aditivo' : 'alterar-aditivo'))
          Utility.waitFor(() => {
            this.router.navigate([`/produtos/e-contrato/registro-contrato/${rota}/`, response.identifier],
              { queryParams: { form: this.formulario.get('tipoFormulario').value, mode: 'create', uf: this.formulario.get('ufLicenciamento').value } });
          }, 2000)

          this.childstate.emit(true);
        }

        response.errors.forEach((error) => {
          this.notifierService.showNotification(error.message, `${error.code} - Ocorreu uma falha`, 'error');
        })

      }, error => {

        this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error')
        this.formSubmitted = false;
      });
  }

  private initializeForm(): void {

    this.formulario = this.fb.group({
      empresa: ['', Validators.required],
      tipoOperacao: ['', Validators.required],
      numeroContrato: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(20)])],
      ufLicenciamento: [{ value: '', disabled: true }, Validators.required,],
      tipoFormulario: [TipoFormulario.STEPPER, Validators.required],
      registroFrota: false,
    })
  }

  private criarRascunhoResumo(protocolo: string = null): void {
    this.novoRascunho = {
      operacaoId: this.formulario.get('tipoOperacao').value,
      numeroContrato: this.formulario.get('numeroContrato').value,
      ufLicenciamento: this.formulario.get('ufLicenciamento').value,
      tipoFormulario: this.formulario.get('tipoFormulario').value == 'onepage' ? 1 : 2,
      protocoloOrigem: protocolo,
      ehFrota: this.formulario.get('registroFrota').value
    }
  }

  formatCnpj(cnpj: string) {
    return Utility.formatCnpj(cnpj);
  }

  sortUFs() {
    let sortedUfs = this.sortPipe.transform(this.ufsLicenciamento.filter(d => d), 'asc', 'ufDetran');
    this.ufsLicenciamento = sortedUfs;
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

  openDialog() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: TransacaoNegadaAlertComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar'
        },
        disableSaveWithoutData: true
      },
    });
  }

  openModalTipoFormulario() {
    this.dialog.open(DialogCustomComponent, {
      width: '424px',
      height: '380px',
      panelClass: 'dialog-form-info',
      data: {
        component: DialogFormInfoComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar'
        },
        buttonCustom: {
          value: false,
          text: 'Entendi',
          showOthers: false,
          showBtn: true
        }
      }
    });
  }
}
