import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CriarPerfilComponent } from './pages/criar-perfil/criar-perfil.component';
import { PerfisComponent } from './perfis.component';


const routes: Routes = [
  {
    path: '',
    component: PerfisComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'incluir-perfil',
        component: CriarPerfilComponent,
        data: {
          breadcrumb: 'Incluir perfil'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'editar-perfil/:perfilId',
        component: CriarPerfilComponent,
        data: {
          breadcrumb: 'Editar perfil'
        },
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfisRoutingModule { }
