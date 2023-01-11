import { BaseResponse } from "src/app/core/responses/base.response";
import { RegistrosPorEstado } from "../models/registro-por-estado.model";

export class ObterGraficoRegistroEstadoResponse extends BaseResponse {
  registros: RegistrosPorEstado[];
}
