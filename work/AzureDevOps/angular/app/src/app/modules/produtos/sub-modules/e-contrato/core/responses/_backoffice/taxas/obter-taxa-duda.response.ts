import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterTaxaDudaResponse extends BaseResponse {
  id: number;
  qtdGuiaDisponivel: number;
  ativo: boolean;
}