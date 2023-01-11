import { BaseResponse } from "src/app/core/responses/base.response";
import { EmpresasUsuario } from "../../models/empresas/empresas-usuario.model";

export class ObterEmpresasUsuarioResponse extends BaseResponse {
    empresas: EmpresasUsuario[];
}
