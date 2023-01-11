import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomPaginatorIntl } from '../../produtos/sub-modules/e-contrato/services/custom-paginator.service';
import { PerfisComponent } from './perfis.component';
import { PerfisRoutingModule } from './perfis-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TablePerfilComponent } from './components/table-perfis/table-perfis.component';

import { NgxMaskModule } from 'ngx-mask';
import { CriarPerfilComponent } from './pages/criar-perfil/criar-perfil.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GrupoPermissaoService } from './services/backoffice/grupo-permissao.service';
import { PerfilService } from './services/backoffice/perfil.service';

@NgModule({
  declarations: [
    PerfisComponent,
    TablePerfilComponent,
    CriarPerfilComponent 
  ],
  imports: [
    CommonModule,  
    SharedModule,  
    PerfisRoutingModule,
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
    MatSortModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
  ],
  exports: [],
  providers: [
    GrupoPermissaoService,
    PerfilService,
    {
      provide: MatPaginatorIntl,
      useClass: CustomPaginatorIntl,
    },
  ]
})
export class PerfisModule {}
