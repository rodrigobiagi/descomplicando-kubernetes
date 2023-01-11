import { BaseResponse } from "src/app/core/responses/base.response";
import { EmpresasAF } from "../../../models/empresas/empresasAF.model";

export class ObterEmpresasPorUsuarioGuidResponse extends BaseResponse {
    empresas: EmpresasAF[];
}
