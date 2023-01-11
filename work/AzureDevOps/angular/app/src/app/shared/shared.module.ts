import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexModule } from "@angular/flex-layout";
import { HeaderComponent } from "./components/header/header.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatRadioModule } from "@angular/material/radio";

import { NotificacaoComponent } from './components/notificacao/notificacao.component';
import { DialogProfileComponent } from './components/dialog-profile/dialog-profile.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from "@angular/router";
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { BreadcrumbModule } from "xng-breadcrumb";
import { StoreModule } from "@ngrx/store";
import { preloaderReducer } from "./store/preloader/preloader.reducer";
import { PreloaderComponent } from './components/preloader/preloader.component';
import { NotifierComponent } from './components/notifier/notifier.component';
import { NotifierService } from "./components/notifier/notifier.service";
import { InfoLoadingComponent } from './components/info-loading/info-loading.component';
import { infoLoadingReducer } from "./store/info-loading/info-loading.reducer";
import { DialogSimpleComponent } from './components/dialog-simple/dialog-simple.component';
import { DialogSimpleService } from "./components/dialog-simple/dialog-simple.service";
import { IconeFalhaComponent } from './widgets/icone-falha/icone-falha.component';
import { IconeSucessoComponent } from './widgets/icone-sucesso/icone-sucesso.component';
import { ButtonComponent } from './widgets/button/button.component';
import { notificacaoRegistroContratoReducer } from "./store/notificacoes/notificacao-registro-contrato/notificacao-registro-contrato.reducer";
import { NumbersOnlyDirective } from "./directives/numbers-only.directive";
import { AlphanumericsOnlyDirective } from './directives/alphanumerics-only.directive';
import { notificacaoInconsistenciaValidadorReducer } from "./store/notificacoes/notificacao-inconsistencia-validador/notificacao-inconsistencia-validador.reducer";
import { AttributeDirective } from './directives/attribute.directive';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { SendFileComponent } from './components/send-file/send-file.component';
import { DialogCustomComponent } from "./components/dialog-custom/dialog-custom.component";
import { SendImageComponent } from "./components/send-image/send-image.component";
import { LoadingSkeletonDirective } from './directives/loading-skeleton.directive';
import { SkeletonRectComponent } from './components/skeleton-rect/skeleton-rect.component';
import { PercentageDirective } from "./directives/percentage.directive";
import { MatTooltipModule } from "@angular/material/tooltip";
import { notificacaoConsultaGravameReducer } from "./store/notificacoes/notificacao-consulta-gravame/notificacao-consulta-gravame.reducer";
import { MenuComponent } from './components/menu/menu.component';
import { MenuItemsComponent } from './components/menu/menu-items/menu-items.component';
import { MenuService } from "./services/menu.service";
import { GridFilterComponent } from "./components/grid-filter/grid-filter.component";
import { FilterFieldComponent } from "./components/filter-field/filter-field.component";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatNativeDateModule } from "@angular/material/core";
import { NoopScrollStrategy } from "@angular/cdk/overlay";

@NgModule({
  declarations: [
    HeaderComponent,
    NotificacaoComponent,
    DialogProfileComponent,
    FooterComponent,
    BreadcrumbComponent,
    PreloaderComponent,
    NotifierComponent,
    InfoLoadingComponent,
    DialogSimpleComponent,
    IconeFalhaComponent,
    IconeSucessoComponent,
    ButtonComponent,
    NumbersOnlyDirective,
    AlphanumericsOnlyDirective,
    AttributeDirective,
    DragAndDropDirective,
    DialogCustomComponent,
    SendImageComponent,
    SendFileComponent,
    LoadingSkeletonDirective,
    SkeletonRectComponent,
    PercentageDirective,
    MenuComponent,
    MenuItemsComponent,
    GridFilterComponent,
    FilterFieldComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatRadioModule,
    StoreModule.forFeature('infoLoading', infoLoadingReducer),
    StoreModule.forFeature('preloader', preloaderReducer),
    StoreModule.forFeature('notificacaoRegistroContrato', notificacaoRegistroContratoReducer),
    StoreModule.forFeature('notificacaoInconsistenciaValidador', notificacaoInconsistenciaValidadorReducer),
    StoreModule.forFeature('notificacaoConsultaGravame', notificacaoConsultaGravameReducer)
  ],
  exports: [
    HeaderComponent,
    NotificacaoComponent,
    FooterComponent,
    BreadcrumbComponent,
    PreloaderComponent,
    InfoLoadingComponent,
    IconeFalhaComponent,
    IconeSucessoComponent,
    ButtonComponent,
    NumbersOnlyDirective,
    AlphanumericsOnlyDirective,
    AttributeDirective,
    DragAndDropDirective,
    LoadingSkeletonDirective,
    PercentageDirective,
    MenuComponent,
    GridFilterComponent,
    FilterFieldComponent
  ],
  providers: [
    NotifierService,
    DialogSimpleService,
    MenuService,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 10000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        scrollStrategy: new NoopScrollStrategy()
      }
    }
  ],
  entryComponents: [DialogCustomComponent]
})
export class SharedModule { }