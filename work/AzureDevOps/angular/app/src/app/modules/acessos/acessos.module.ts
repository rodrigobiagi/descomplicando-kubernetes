import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AcessosRoutingModule } from "./acessos-routing.module";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { UsuariosService } from "./usuarios/services/backoffice/usuarios.service";
import { PerfisModule } from "./perfis/perfis.module";
import { EmpresasService } from "./perfis/services/backoffice/empresas.service";

@NgModule({
    declarations: [],
    imports:[
        CommonModule,
        AcessosRoutingModule,
        UsuariosModule,
        PerfisModule
    ],
    providers: [
        UsuariosService,
        EmpresasService
    ]
})
export class AcessosModule { }
