import { Observable } from "rxjs";
import { AlterarAditivoRequest } from "../../core/requests/aditivos/alterar-aditivo.request";
import { RegistrarAditivoRequest } from "../../core/requests/contratos/registrar-aditivo.request";
import { AlterarAditivoResponse } from "../../core/responses/aditivos/alterar-aditivo.response";
import { RegistrarAditivoResponse } from "../../core/responses/contratos/registrar-aditivo.response";

export interface IAditivoService {
    alterarAditivo(aditivo: AlterarAditivoRequest): Observable<AlterarAditivoResponse>;
    registrarAditivo(contrato: RegistrarAditivoRequest): Observable<RegistrarAditivoResponse>;
    retornoTipoAditivo(tipoAditivo: string): void;
}