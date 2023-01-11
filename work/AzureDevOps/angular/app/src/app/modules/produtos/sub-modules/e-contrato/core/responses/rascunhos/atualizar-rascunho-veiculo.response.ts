import { BaseResponse } from "src/app/core/responses/base.response";
import { Veiculo } from "../../models/contratos/veiculo.model";

export class AtualizarRascunhoVeiculoResponse extends BaseResponse {
  veiculo: Veiculo[];
}