import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/core/guards/auth.guard";

import { HomeEcontratoComponent } from "./pages/home-econtrato/home-econtrato.component";
import { GerenciarRegistroComponent } from "./pages/gerenciar-registro/gerenciar-registro.component";
import { CriarRegistroComponent } from "./pages/criar-registro/criar-registro.component";
import { RevisarRegistroComponent } from "./pages/revisar-registro/revisar-registro.component";
import { ConsultarRegistroComponent } from "./pages/consultar-registro/consultar-registro.component";
import { EspelhoContratoComponent } from "./pages/espelho-contrato/espelho-contrato.component";
import { EnviarLoteComponent } from "./pages/enviar-lote/enviar-lote.component";
import { VisualizarInconsistenciasComponent } from "./pages/visualizar-inconsistencias/visualizar-inconsistencias.component";
import { UploadsRealizadosComponent } from "./pages/uploads-realizados/uploads-realizados.component";
import { UploadImagensComponent } from "./pages/upload-imagens/upload-imagens.component";

const routes: Routes = [
  {
    path: '',
    component: HomeEcontratoComponent,
    data: {
      breadcrumb: 'e-Contrato'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'registro-contrato',
    component: GerenciarRegistroComponent,
    data: { breadcrumb: 'Registro de contrato' },
    canActivate: [AuthGuard],
    children: [
      {
        path: 'registrar-contrato/:identifier',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Registrar contrato' },
        canActivate: [AuthGuard],
      },
      {
        path: 'registrar-contrato',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Registrar contrato' },
        canActivate: [AuthGuard],
        children: [
          {
            path: 'revisar-registro/:identifier',
            component: RevisarRegistroComponent,
            data: { breadcrumb: 'Revisar e registrar' },
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'alterar-contrato/:identifier',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Alterar contrato' },
        canActivate: [AuthGuard]
      },
      {
        path: 'alterar-contrato',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Alterar contrato' },
        canActivate: [AuthGuard],
        children: [
          {
            path: 'revisar-registro/:identifier',
            component: RevisarRegistroComponent,
            data: { breadcrumb: 'Revisar e registrar' },
          }
        ]
      },
      {
        path: 'registrar-aditivo/:identifier',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Registrar aditivo' },
        canActivate: [AuthGuard]
      },
      {
        path: 'registrar-aditivo',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Registrar aditivo' },
        canActivate: [AuthGuard],
        children: [
          {
            path: 'revisar-registro/:identifier',
            component: RevisarRegistroComponent,
            data: { breadcrumb: 'Revisar e registrar' }
          }
        ]
      },
      {
        path: 'alterar-aditivo/:identifier',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Alterar aditivo' },
        canActivate: [AuthGuard]
      },
      {
        path: 'alterar-aditivo',
        component: CriarRegistroComponent,
        data: { breadcrumb: 'Alterar aditivo' },
        canActivate: [AuthGuard],
        children: [
          {
            path: 'revisar-registro/:identifier',
            component: RevisarRegistroComponent,
            data: { breadcrumb: 'Revisar e registrar' }
          }
        ]
      }
    ]
  },
  {
    path: 'consultar-registro',
    component: ConsultarRegistroComponent,
    data: {
      breadcrumb: 'Consultar registro'
    },
    canActivate: [AuthGuard],
    children: [
      {
        path: 'espelho-contrato',
        component: EspelhoContratoComponent,
        data: { breadcrumb: 'Espelho do contrato ' },
        canActivate: [AuthGuard],
      },
      {
        path: 'visualizar-inconsistencias',
        component: VisualizarInconsistenciasComponent,
        data: { breadcrumb: 'Visualizar inconsistências' },
        canActivate: [AuthGuard],
      }
    ]
  },
  {
    path: 'enviar-lote',
    component: EnviarLoteComponent,
    data: { breadcrumb: 'Enviar lote' },
    canActivate: [AuthGuard],
    children: [
      {
        path: 'consultar-registro/:protocoloLote',
        component: ConsultarRegistroComponent,
        data: {
          breadcrumb: 'Visualizar lote'
        },
        canActivate: [AuthGuard],
        children: [
          {
            path: 'espelho-contrato',
            component: EspelhoContratoComponent,
            data: { breadcrumb: 'Espelho do contrato ' },
            canActivate: [AuthGuard],
          },
          {
            path: 'visualizar-inconsistencias',
            component: VisualizarInconsistenciasComponent,
            data: { breadcrumb: 'Visualizar inconsistências' },
            canActivate: [AuthGuard],
          }
        ]
      },
    ]
  },
  {
    path: 'uploads-realizados',
    component: UploadsRealizadosComponent,
    data: { breadcrumb: 'Uploads realizados' },
    canActivate: [AuthGuard]
  },
  {
    path: 'upload-imagens',
    component: UploadImagensComponent,
    data: {
      breadcrumb: 'Upload de imagens'
    },
    canActivate: [AuthGuard],
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcontratoRoutingModule { }
