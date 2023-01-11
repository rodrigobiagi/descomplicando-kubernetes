import { Observable } from "rxjs";
import { ObterTiposRestricaoResponse } from "../../core/responses/gravames/obter-tipos-restricao.response";

export interface IGravameService {

    obterTiposRestricao(): Observable<ObterTiposRestricaoResponse>;
}