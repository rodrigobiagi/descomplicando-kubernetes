import { BaseResponse } from "src/app/core/responses/base.response";
import { RascunhoResumo } from "../../models/rascunhos/rascunho-resumo.model";

export class ObterRascunhoResumoPaginationResponse extends BaseResponse {
    rascunhos: RascunhoResumo[] = [];
    totalItems: number;
}