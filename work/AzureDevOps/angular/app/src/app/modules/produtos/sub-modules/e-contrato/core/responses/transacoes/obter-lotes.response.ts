import { BaseResponse } from "src/app/core/responses/base.response"
import { ResumoLote } from "../../models/transacoes/resumo-lote.model"

export class ObterLotesResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  lotes: ResumoLote[];
}