import { BaseResponse } from "src/app/core/responses/base.response"
import { Departamentos } from "src/app/modules/acessos/usuarios/core/models/empresas/departamentos.model";

export class ObterDepartamentosEmpresaResponse extends BaseResponse {
   departamentos: Departamentos[];
}
