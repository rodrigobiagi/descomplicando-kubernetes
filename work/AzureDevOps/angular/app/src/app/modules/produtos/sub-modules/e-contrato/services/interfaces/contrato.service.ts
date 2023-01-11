import { Observable } from "rxjs";
import { AlterarContratoRequest } from "../../core/requests/contratos/alterar-contrato.request";
import { RegistrarContratoRequest } from "../../core/requests/contratos/registrar-contrato.request";
import { AlterarContratoResponse } from "../../core/responses/contratos/alterar-contrato.response";
import { ConsultarContratoResponse } from "../../core/responses/contratos/consultar-contrato.response";
import { RegistrarContratoResponse } from "../../core/responses/contratos/registrar-contrato.response";

export interface IContratoService {
    registrarContrato(contrato: RegistrarContratoRequest): Observable<RegistrarContratoResponse>;
    alterarContrato(contrato: AlterarContratoRequest): Observable<AlterarContratoResponse>;
    retornoContrato(contrato: ConsultarContratoResponse): void;
    retornoProtocolo(protocoloOrigem: string): void;
}