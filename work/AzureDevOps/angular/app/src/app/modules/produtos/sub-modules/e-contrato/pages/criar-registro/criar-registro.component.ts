import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { DialogSimpleService } from 'src/app/shared/components/dialog-simple/dialog-simple.service';
import { INotificacaoConsultaGravameState } from 'src/app/shared/store/notificacoes/notificacao-consulta-gravame/notificacao-consulta-gravame.reducer';
import { TipoFormulario } from '../../core/enums/tipo-formulario.enum';
import { ObterAgentesFinanceirosResponse } from '../../core/responses/_backoffice/agentes-financeiros/obter-agentes-financeiros.response';
import { GravameResponse } from '../../core/responses/contratos/gravame.response';
import { ObterRascunhoResumoResponse } from '../../core/responses/rascunhos/obter-rascunho-resumo.response';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { ContratoService } from '../../services/contrato.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AgenteFinanceiro } from '../../core/models/contratos/agente-financeiro.model';
import { Mode } from 'src/app/core/enums/mode.enum';
import { AtualizarRascunhoCredorRequest } from '../../core/requests/rascunhos/atualizar-rascunho-credor.request';
import { Utility } from 'src/app/core/common/utility';
import { AtualizarRascunhoCredorResponse } from '../../core/responses/rascunhos/atualizar-rascunho-credor.response';
import { SubSink } from 'subsink';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { SignalrService } from 'src/app/core/hub/signalr.service';

@Component({
  selector: 'app-criar-registro',
  templateUrl: './criar-registro.component.html',
  styleUrls: ['./criar-registro.component.scss']
})
export class CriarRegistroComponent implements OnInit {

  tipoFormulario: TipoFormulario;
  identifier: string;
  tipoOperacao: number;
  ehFrota: boolean;
  childstate: boolean = false;
  retornoGravame: GravameResponse = null;
  uf: string;
  mode: Mode;
  empresaId: number = null;
  private agenteFinanceiro: AgenteFinanceiro = null;
  rascunhoCredor: AtualizarRascunhoCredorRequest = null;
  private subscriptions = new SubSink();

  url;
  operacao: TipoOperacao;
  permissoesFlag1: Permissao;
  permissoesFlag2: Permissao;
  permissoesFlag3: Permissao;
  permissoesFlag4: Permissao;

  notificacaoConsultaGravame$;

  constructor(private activeRoute: ActivatedRoute,
    private router: Router,
    private rascunhoService: RascunhoService,
    private contratoService: ContratoService,
    private storeConsultaGravame: Store<{ notificacaoConsultaGravame: INotificacaoConsultaGravameState }>,
    private agenteFinanceiroService: AgenteFinanceiroService,
    private dialogSimple: DialogSimpleService,
    private signalrService: SignalrService) {

    this.identifier = this.activeRoute.snapshot.params['identifier'];

    this.activeRoute.queryParams.subscribe(params => {
      this.mode = params.mode as Mode
      this.uf = params.uf
    });

    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url'].split('registro-contrato')[1]?.includes('revisar-registro');
        this.url = val['url'].split('registro-contrato')[1];
        this.operacao = val['url'].split('registro-contrato')[1]?.startsWith('/registrar-contrato') ? TipoOperacao.RegistrarContrato :
          (val['url'].split('registro-contrato')[1]?.startsWith('/alterar-contrato') ? TipoOperacao.AlterarContrato :
            (val['url'].split('registro-contrato')[1]?.startsWith('/registrar-aditivo') ? TipoOperacao.RegistrarAditivo : TipoOperacao.AlterarAditivo));
      }
    });
  }

  ngOnInit(): void {
    this.verifyPermission();

    if (!this.childstate) {
      this.notificacaoConsultaGravame$ = this.storeConsultaGravame.select('notificacaoConsultaGravame')
        .pipe(map(notification => { this.obterNotificacaoGravame(notification); }));

      this.activeRoute.queryParams.subscribe(params => {

        if (params.form !== 'stepper' && params.form !== 'onepage') {
          this.router.navigateByUrl('/produtos/e-contrato/registro-contrato')
        }

        this.tipoFormulario = params.form;
      });

      this.rascunhoService.obterRascunhoResumo(this.identifier).subscribe((response: ObterRascunhoResumoResponse) => {
        this.tipoOperacao = response.rascunho.operacaoId;
        this.ehFrota = response.rascunho.ehFrota;
        if (response.rascunho.protocoloOrigem === null) { response.rascunho.protocoloOrigem = "0" }
        this.contratoService.retornoProtocolo(response.rascunho.protocoloOrigem);
      });

      this.subscriptions.add(
        this.agenteFinanceiroService.empresaId$.subscribe(empresaId => { this.empresaId = empresaId; }),
      );

      this.carregarAgenteFinanceiro()
    }
  }

  obterNotificacaoGravame(notification: INotificacaoConsultaGravameState) {
    if (notification.codigo == 0 && this.agenteFinanceiro) {
      if (this.agenteFinanceiro?.documento.numero !== notification.cnpjAgente) {
        let dialog = this.dialogSimple.showDialog('O GRAVAME não pertence ao Agente Financeiro!', 'OK', '', 'fail');
        dialog.afterClosed().toPromise();
        this.retornoGravame = null;
        return;
      }

      this.retornoGravame = <GravameResponse>{
        codigo: notification.codigo,
        descricao: notification.descricao,
        anoModelo: notification.anoModelo,
        anoFabricacao: notification.anoFabricacao,
        remarcado: notification.remarcado,
        dataVigenciaContrato: notification.dataVigenciaContrato,
        cnpjAgente: notification.cnpjAgente,
        idAgente: this.agenteFinanceiro?.id
      };
    }
  }

  private carregarEmpresa(empresaId: number) {
    let usuarioGuid = sessionStorage.getItem('userGuid');
    this.agenteFinanceiroService.obterAgentesFinanceiros(usuarioGuid, empresaId, this.uf)
      .subscribe((response: ObterAgentesFinanceirosResponse) => {
        if (response.empresa.id) {
          this.agenteFinanceiroService.retornoAgenteFinanceiro(response.empresa);
          this.agenteFinanceiro = response.empresa;
          this.atualizarRascunho();
        }
      })
  }

  private atualizarRascunho() {
    if (this.agenteFinanceiro) {
      this.criarRascunhoCredor(this.agenteFinanceiro);
      if (!Utility.isNullOrEmpty(this.identifier)) {
        this.rascunhoService.atualizarRascunhoCredor(this.rascunhoCredor, this.identifier).toPromise();
      }
      return;
    }
  }

  private carregarAgenteFinanceiro() {
    if (this.mode == Mode.Create) {
      this.carregarEmpresa(this.empresaId);
      return;
    }

    this.rascunhoService.obterRascunhoCredor(this.identifier).toPromise()
      .then((response: AtualizarRascunhoCredorResponse) => {
        let agente = <AgenteFinanceiro>{
          id: response.id,
          codigoAgenteFinanceiro: response.codigoAgenteFinanceiro,
          nomeAgenteFinanceiro: response.nomeAgenteFinanceiro,
          contato: response.contato,
          documento: response.documento,
          endereco: response.endereco
        }
        this.agenteFinanceiroService.retornoAgenteFinanceiro(agente);
        this.agenteFinanceiro = agente;
      });
  }

  private criarRascunhoCredor(agenteFinanceiro: AgenteFinanceiro): void {
    this.rascunhoCredor = new AtualizarRascunhoCredorRequest();
    this.rascunhoCredor.empresaId = agenteFinanceiro.id;
    this.rascunhoCredor.agenteFinanceiro.id = agenteFinanceiro.id;
    this.rascunhoCredor.agenteFinanceiro.codigoAgenteFinanceiro = agenteFinanceiro.codigoAgenteFinanceiro;
    this.rascunhoCredor.agenteFinanceiro.nomeAgenteFinanceiro = agenteFinanceiro.nomeAgenteFinanceiro;
    this.rascunhoCredor.agenteFinanceiro.documento.numero = agenteFinanceiro.documento.numero;
    this.rascunhoCredor.agenteFinanceiro.documento.tipoDocumento = agenteFinanceiro.documento.tipoDocumento;
    this.rascunhoCredor.endereco.cep = agenteFinanceiro.endereco.cep;
    this.rascunhoCredor.endereco.logradouro = agenteFinanceiro.endereco.logradouro;
    this.rascunhoCredor.endereco.numero = agenteFinanceiro.endereco.numero;
    this.rascunhoCredor.endereco.bairro = agenteFinanceiro.endereco.bairro;
    this.rascunhoCredor.endereco.complemento = agenteFinanceiro.endereco.complemento;
    this.rascunhoCredor.endereco.uf = agenteFinanceiro.endereco.uf;
    this.rascunhoCredor.endereco.municipio = agenteFinanceiro.endereco.municipio;
    this.rascunhoCredor.endereco.codigoMunicipio = agenteFinanceiro.endereco.codigoMunicipio;
    this.rascunhoCredor.contato.ddd = agenteFinanceiro.contato.ddd;
    this.rascunhoCredor.contato.telefone = agenteFinanceiro.contato.telefone;
    this.rascunhoCredor.contato.email = agenteFinanceiro.contato.email;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.signalrService.hubConnection.off('ConsultaGravameNotification')
    this.identifier = null;
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
    this.permissoesFlag1 = listaPermissoes.filter(permissao => permissao.palavraChave == 'CONTRATO_REGISTRAR_CONTRATO')[0];
    this.permissoesFlag2 = listaPermissoes.filter(permissao => permissao.palavraChave == 'CONTRATO_ALTERAR_CONTRATO')[0];
    this.permissoesFlag3 = listaPermissoes.filter(permissao => permissao.palavraChave == 'CONTRATO_REGISTRAR_ADITIVO')[0];
    this.permissoesFlag4 = listaPermissoes.filter(permissao => permissao.palavraChave == 'CONTRATO_ALTERAR_ADITIVO')[0];

    if (this.operacao == TipoOperacao.RegistrarContrato && !this.permissoesFlag1.consultar) {
      this.router.navigate(['./permissao-negada']);
      return;
    }

    if (this.operacao == TipoOperacao.AlterarContrato && !this.permissoesFlag2.consultar) {
      this.router.navigate(['./permissao-negada']);
      return;
    }

    if (this.operacao == TipoOperacao.RegistrarAditivo && !this.permissoesFlag3.consultar) {
      this.router.navigate(['./permissao-negada']);
      return;
    }

    if (this.operacao == TipoOperacao.AlterarAditivo && !this.permissoesFlag4.consultar) {
      this.router.navigate(['./permissao-negada']);
      return;
    }
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
