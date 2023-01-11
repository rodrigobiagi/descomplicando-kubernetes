import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosResumo } from "../models/registros-resumo.model";

export class ObterResumoResponse extends BaseResponse {
  registros: RegistrosResumo;
  registrosInconsistentes: RegistrosResumo;
  registrosImagensPendentes: RegistrosResumo;
}