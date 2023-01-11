import { BaseResponse } from "src/app/core/responses/base.response";

export class AtualizarRascunhoContratoResponse extends BaseResponse {
    numeroContrato: string;
    numeroRestricao: number;
    ufLicenciamento: string;
    tipoRestricao: number;
    dataContrato: string;
    numeroTaxaDetran: string;;
    numeroAditivo: string;
    dataAditivo: string;
    tipoAditivo?: number;
}