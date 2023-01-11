import { BaseResponse } from "src/app/core/responses/base.response";
import { Transacoes } from "../../models/transacoes/transacoes.model";

export class ObterTransacoesPaginationResponse extends BaseResponse {
    transacoes: Transacoes[] = [];
    totalItems: number;
}