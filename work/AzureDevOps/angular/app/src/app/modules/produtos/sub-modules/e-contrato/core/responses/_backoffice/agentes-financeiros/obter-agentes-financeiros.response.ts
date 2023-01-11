import { BaseResponse } from "src/app/core/responses/base.response";
import { AgenteFinanceiro } from "../../../models/contratos/agente-financeiro.model";

export class ObterAgentesFinanceirosResponse extends BaseResponse {
    empresa: AgenteFinanceiro;
}