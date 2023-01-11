import { Observable } from "rxjs";
import { ObterAgentesFinanceirosResponse } from "../../../core/responses/_backoffice/agentes-financeiros/obter-agentes-financeiros.response";

export interface IAgenteFinanceiroService {
  obterAgentesFinanceiros(usuarioGuid: string, empresaId: number, uf: string): Observable<ObterAgentesFinanceirosResponse>;
}