import { TipoOperacao } from "../../enums/tipo-operacao.enum";
import { TipoStatusTransacao } from "../../enums/tipo-status-transacao.enum";

export class ConsultarContratoRequest {
    numeroContrato: string;
    uf: string;
    statusTransacao?: TipoStatusTransacao;
    tipoOperacao?: TipoOperacao;
}