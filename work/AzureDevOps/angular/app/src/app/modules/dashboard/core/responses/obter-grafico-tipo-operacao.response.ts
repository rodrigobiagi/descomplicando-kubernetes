import { BaseResponse } from "src/app/core/responses/base.response";
import { GraficoTipoOperacao } from "../models/tipo-operacao.model";

export class ObterGraficoTipoOperacaoResponse extends BaseResponse {
  registros: GraficoTipoOperacao[];
}