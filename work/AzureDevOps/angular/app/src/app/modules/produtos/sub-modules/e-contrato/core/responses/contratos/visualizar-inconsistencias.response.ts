import { BaseResponse } from "src/app/core/responses/base.response";
import { DadosInconsistenciasContrato } from "../../models/inconsistencias-contrato/dados-inconsistencias-contrato.model";

export class ObterInconsistenciasContratoResponse extends BaseResponse{
    categoria: string;
    dadoInconsistenciaContrato: DadosInconsistenciasContrato[] = [];
}