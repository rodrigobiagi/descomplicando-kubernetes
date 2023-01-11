import { BaseResponse } from "src/app/core/responses/base.response";
import { AtividadesRecentes } from "../models/atividades-recentes.model";

export class ObterAtividadesRecentesResponse extends BaseResponse {
  atividades: AtividadesRecentes[];
}