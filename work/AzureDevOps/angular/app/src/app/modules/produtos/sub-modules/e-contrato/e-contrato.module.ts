import { CommonModule } from "@angular/common";
import { Injector, NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { EcontratoRoutingModule } from "./e-contrato-routing.module";
import { HomeEcontratoComponent } from './pages/home-econtrato/home-econtrato.component';
import { DadosVeiculoComponent } from './components/dados-veiculo/dados-veiculo.component';
import { DadosContratoComponent } from './components/dados-contrato/dados-contrato.component';
import { ReactiveFormsModule } from "@angular/forms";
import { GerenciarRegistroComponent } from './pages/gerenciar-registro/gerenciar-registro.component';
import { CriarRegistroComponent } from './pages/criar-registro/criar-registro.component';
import { RevisarRegistroComponent } from './pages/revisar-registro/revisar-registro.component';
import { ConsultarRegistroComponent } from './pages/consultar-registro/consultar-registro.component';
import { CriarRascunhoResumoComponent } from './components/criar-rascunho-resumo/criar-rascunho-resumo.component';
import { RascunhoListComponent } from './components/rascunho-list/rascunho-list.component';
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxMaskModule } from "ngx-mask";
import { AppSettings } from "src/app/configs/app-settings.config";
import { RascunhoService } from "./services/rascunho.service";

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { DialogCommonComponent } from './components/dialog-common/dialog-common.component';
import { VeiculoService } from "./services/veiculo.service";
import { GeograficoService } from "./services/geografico.service";
import { AgenteFinanceiroService } from "./services/_backoffice/agente-financeiro.service";
import { AditivoService } from "./services/aditivo.service";
import { ContratoService } from "./services/contrato.service";
import { DominioService } from "./services/dominio.service";
import { TransacaoService } from "./services/transacao.service";
import { FormStepperComponent } from './components/form-stepper/form-stepper.component';
import { FormOnepageComponent } from './components/form-onepage/form-onepage.component';
import { DadosCredorComponent } from './components/dados-credor/dados-credor.component';
import { DadosDevedorComponent } from './components/dados-devedor/dados-devedor.component';
import { DadosFinanciamentoComponent } from './components/dados-financiamento/dados-financiamento.component';
import { DadosContratoComplementarComponent } from './components/dados-contrato-complementar/dados-contrato-complementar.component';
import { DialogEnviarRegistroComponent } from './components/dialog-enviar-registro/dialog-enviar-registro.component';
import { TipoOperacaoPipe } from "./core/pipes/tipo-operacao.pipe";
import { DialogDetalheErroRevisaoComponent } from './components/dialog-detalhe-erro-revisao/dialog-detalhe-erro-revisao.component';
import { CustomPaginatorIntl } from "./services/custom-paginator.service";
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from "ng2-currency-mask";
import { RevisaoRascunhoVeiculoComponent } from './components/rascunhos/revisao/revisao-rascunho-veiculo/revisao-rascunho-veiculo.component';
import { RevisaoRascunhoContratoComponent } from './components/rascunhos/revisao/revisao-rascunho-contrato/revisao-rascunho-contrato.component';
import { RevisaoRascunhoComplementarComponent } from './components/rascunhos/revisao/revisao-rascunho-complementar/revisao-rascunho-complementar.component';
import { RevisaoRascunhoFinanciamentoComponent } from './components/rascunhos/revisao/revisao-rascunho-financiamento/revisao-rascunho-financiamento.component';
import { RevisaoRascunhoCredorComponent } from './components/rascunhos/revisao/revisao-rascunho-credor/revisao-rascunho-credor.component';
import { RevisaoRascunhoDevedorComponent } from './components/rascunhos/revisao/revisao-rascunho-devedor/revisao-rascunho-devedor.component';
import { EspelhoContratoComponent } from "./pages/espelho-contrato/espelho-contrato.component";
import { EspelhoDadosVeiculoComponent } from './components/espelho-contrato/espelho-dados-veiculo/espelho-dados-veiculo.component';
import { EspelhoDadosContratoComponent } from './components/espelho-contrato/espelho-dados-contrato/espelho-dados-contrato.component';
import { EspelhoDadosComplementarComponent } from './components/espelho-contrato/espelho-dados-complementar/espelho-dados-complementar.component';
import { EspelhoDadosFinanciamentoComponent } from './components/espelho-contrato/espelho-dados-financiamento/espelho-dados-financiamento.component';
import { EspelhoDadosConsorcioComponent } from './components/espelho-contrato/espelho-dados-consorcio/espelho-dados-consorcio.component';
import { EspelhoDadosCredorComponent } from './components/espelho-contrato/espelho-dados-credor/espelho-dados-credor.component';
import { EspelhoDadosDevedorComponent } from './components/espelho-contrato/espelho-dados-devedor/espelho-dados-devedor.component';
import { DialogCustomService } from "./services/dialog-custom.service";
import { EnviarLoteComponent } from './pages/enviar-lote/enviar-lote.component';
import { VisualizarInconsistenciasComponent } from './pages/visualizar-inconsistencias/visualizar-inconsistencias.component';
import { VisualizarInconsistenciasDadosVeiculoComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-dados-veiculo/visualizar-inconsistencias-dados-veiculo.component';
import { VisualizarInconsistenciasDadosFinanciamentoComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-dados-financiamento/visualizar-inconsistencias-dados-financiamento.component';
import { VisualizarInconsistenciasDadosContratoComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-dados-contrato/visualizar-inconsistencias-dados-contrato.component';
import { VisualizarInconsistenciasDadosComplementarComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-dados-complementar/visualizar-inconsistencias-dados-complementar.component';
import { VisualizarInconsistenciasDadosCredorComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-dados-credor/visualizar-inconsistencias-dados-credor.component';
import { VisualizarInconsistenciasDadosDevedorComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-dados-devedor/visualizar-inconsistencias-dados-devedor.component';
import { DadosTerceiroGarantidorComponent } from './components/dados-terceiro-garantidor/dados-terceiro-garantidor.component';
import { EspelhoDadosGarantidorComponent } from './components/espelho-contrato/espelho-dados-garantidor/espelho-dados-garantidor.component';
import { VisualizarInconsistenciasTerceiroGarantidorComponent } from './components/visualizar-inconsistencias/visualizar-inconsistencias-terceiro-garantidor/visualizar-inconsistencias-terceiro-garantidor.component';
import { ImagemService } from "./services/image.service";
import { BackofficeService } from "./services/_backoffice/_backoffice.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { MatSortModule } from "@angular/material/sort";
import { EspelhoDadosVeiculosFrotaComponent } from './components/espelho-contrato/espelho-dados-veiculos-frota/espelho-dados-veiculos-frota.component';
import { TransacaoNegadaAlertComponent } from './components/transacao-negada-alert/transacao-negada-alert.component';
import { DialogAddVeiculoComponent } from './components/dialog-add-veiculo/dialog-add-veiculo.component';
import { DadosVeiculoListComponent } from './components/dados-veiculo-list/dados-veiculo-list.component';
import { DialogConfirmarBaixaContratoComponent } from './components/dialog-confirmar-baixa-contrato/dialog-confirmar-baixa-contrato.component';
import { DialogConsultarSolicitacaoBaixaComponent } from './components/dialog-consultar-solicitacao-baixa/dialog-consultar-solicitacao-baixa.component';
import { MatRadioModule } from "@angular/material/radio";
import { UploadsRealizadosComponent } from './pages/uploads-realizados/uploads-realizados.component';
import { UploadImagensComponent } from './pages/upload-imagens/upload-imagens.component';
import { TableUploadsRealizadosComponent } from "./components/upload-imagens/table-uploads-realizados/table-uploads-realizados.component";
import { DialogRevisarInconsistenciasComponent } from "./components/upload-imagens/dialog-revisar-inconsistencias/dialog-revisar-inconsistencias.component";
import { DialogFormInfoComponent } from './components/dialog-form-info/dialog-form-info.component';
import { MatCarouselModule } from "@ngmodule/material-carousel";
import { BlocoInformacoesRegistroComponent } from './components/bloco-informacoes-registro/bloco-informacoes-registro.component';


export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: "."
};

@NgModule({
  declarations: [
    HomeEcontratoComponent,
    DadosVeiculoComponent,
    DadosContratoComponent,
    GerenciarRegistroComponent,
    CriarRegistroComponent,
    RevisarRegistroComponent,
    ConsultarRegistroComponent,
    CriarRascunhoResumoComponent,
    RascunhoListComponent,
    FormStepperComponent,
    FormOnepageComponent,
    DadosCredorComponent,
    DadosDevedorComponent,
    DadosFinanciamentoComponent,
    DadosContratoComplementarComponent,
    DialogEnviarRegistroComponent,
    TipoOperacaoPipe,
    DialogDetalheErroRevisaoComponent,
    DialogCommonComponent,
    RevisaoRascunhoVeiculoComponent,
    RevisaoRascunhoContratoComponent,
    RevisaoRascunhoComplementarComponent,
    RevisaoRascunhoFinanciamentoComponent,
    RevisaoRascunhoCredorComponent,
    RevisaoRascunhoDevedorComponent,
    EspelhoContratoComponent,
    EspelhoDadosVeiculoComponent,
    EspelhoDadosContratoComponent,
    EspelhoDadosComplementarComponent,
    EspelhoDadosFinanciamentoComponent,
    EspelhoDadosConsorcioComponent,
    EspelhoDadosCredorComponent,
    EspelhoDadosDevedorComponent,
    EnviarLoteComponent,
    VisualizarInconsistenciasComponent,
    VisualizarInconsistenciasDadosVeiculoComponent,
    VisualizarInconsistenciasDadosFinanciamentoComponent,
    VisualizarInconsistenciasDadosContratoComponent,
    VisualizarInconsistenciasDadosComplementarComponent,
    VisualizarInconsistenciasDadosCredorComponent,
    VisualizarInconsistenciasDadosDevedorComponent,
    DadosTerceiroGarantidorComponent,
    EspelhoDadosGarantidorComponent,
    VisualizarInconsistenciasTerceiroGarantidorComponent,
    EspelhoDadosVeiculosFrotaComponent,
    TransacaoNegadaAlertComponent,
    DialogAddVeiculoComponent,
    DadosVeiculoListComponent,
    UploadsRealizadosComponent,
    TableUploadsRealizadosComponent,
    DialogRevisarInconsistenciasComponent,
    UploadImagensComponent,
    DialogConfirmarBaixaContratoComponent,
    DialogConsultarSolicitacaoBaixaComponent,
    DialogFormInfoComponent,
    BlocoInformacoesRegistroComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    EcontratoRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatCheckboxModule,
    CurrencyMaskModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSortModule,
    MatRadioModule,
    MatProgressBarModule,
    NgxMaskModule.forChild(),
    MatCarouselModule
  ],
  providers: [
    AppSettings,
    RascunhoService,
    VeiculoService,
    GeograficoService,
    AgenteFinanceiroService,
    AditivoService,
    ContratoService,
    DominioService,
    TransacaoService,
    DialogCustomService,
    ImagemService,
    BackofficeService,
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR'
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        hideRequiredMarker: true
      }
    },
    {
      provide: MatPaginatorIntl,
      useClass: CustomPaginatorIntl
    },
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    }
  ]
})
export class EcontratoModule {

  constructor(private injector: Injector) {
    appInjector = this.injector;
  }
}

export let appInjector: Injector;
