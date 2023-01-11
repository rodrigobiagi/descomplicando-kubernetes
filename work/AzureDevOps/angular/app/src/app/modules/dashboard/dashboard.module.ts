import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { BubbleChartComponent } from './components/bubble-chart/bubble-chart.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'src/app/shared/shared.module';
import { BlocoVazioComponent } from './components/bloco-vazio/bloco-vazio.component';
import { RegistrosTipoOperacaoComponent } from './components/registros-tipo-operacao/registros-tipo-operacao.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from './services/dashboard.service';
import { RegistrosResumoComponent } from './components/registros-resumo/registros-resumo.component';
import { AtalhosComponent } from './components/atalhos/atalhos.component';
import { AtividadesRecentesComponent } from './components/atividades-recentes/atividades-recentes.component';
import { BotoesFiltroResumoComponent } from './components/botoes-filtro-resumo/botoes-filtro-resumo.component';
import { CentralAjudaComponent } from './components/central-ajuda/central-ajuda.component';
import { BlocoNotificacoesComponent } from './components/bloco-notificacoes/bloco-notificacoes.component';
import { DashboardComponent } from './dashboard.component';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { BannerComunicacaoComponent } from './components/banner-comunicacao/banner-comunicacao.component';

@NgModule({
  declarations: [
    DashboardComponent,
    BubbleChartComponent,
    BlocoVazioComponent,
    RegistrosTipoOperacaoComponent,
    RegistrosResumoComponent,
    AtalhosComponent,
    AtividadesRecentesComponent,
    BotoesFiltroResumoComponent,
    CentralAjudaComponent,
    BlocoNotificacoesComponent,
    BannerComunicacaoComponent,
  ],
  exports: [
    BubbleChartComponent,
    BlocoVazioComponent,
    RegistrosTipoOperacaoComponent,
    RegistrosResumoComponent,
    AtalhosComponent,
    AtividadesRecentesComponent,
    BotoesFiltroResumoComponent,
    CentralAjudaComponent,
    BlocoNotificacoesComponent,
    BannerComunicacaoComponent
  ],
  imports: [
    NgApexchartsModule,
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
    MatButtonToggleModule,
    MatSortModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatCarouselModule
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }
