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
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './usuarios.component';
import { CustomPaginatorIntl } from '../../produtos/sub-modules/e-contrato/services/custom-paginator.service';
import { TableUsuariosComponent } from './components/table-usuarios/table-usuarios.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { NgxMaskModule } from 'ngx-mask';
import { CriarUsuarioComponent } from './criar-usuario/criar-usuario.component';
import { TableUsuariosConvidadosComponent } from './components/table-usuarios-convidados/table-usuarios-convidados.component';
import { ConvidarUsuarioComponent } from './components/convidar-usuario/convidar-usuario.component';


@NgModule({
  declarations: [
    UsuariosComponent,
    TableUsuariosComponent,
    CriarUsuarioComponent,
    TableUsuariosConvidadosComponent,
    ConvidarUsuarioComponent  
  ],
  imports: [
    CommonModule,  
    SharedModule,  
    UsuariosRoutingModule,
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
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
  ],
  exports: [],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: CustomPaginatorIntl,
    },
  ],
//   entryComponents: [DialogListarEnderecosComponent],
})
export class UsuariosModule {}
