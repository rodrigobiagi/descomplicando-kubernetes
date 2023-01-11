import { Observable } from "rxjs";
import { DominioResponse } from "../../core/responses/dominios/dominio.response";

export interface IDominioService {
    obterPorTipo(tipoDominio: string): Observable<DominioResponse>
}