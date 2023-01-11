import { BaseResponse } from "src/app/core/responses/base.response";
import { Perfis } from "../../../usuarios/core/models/empresas/perfis.model";

export class ObterPerfisPaginationResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    perfis: Perfis[];
}
