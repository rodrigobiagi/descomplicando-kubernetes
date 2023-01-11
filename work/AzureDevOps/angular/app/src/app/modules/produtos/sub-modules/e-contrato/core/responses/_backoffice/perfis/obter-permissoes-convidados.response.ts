import { BaseResponse } from "src/app/core/responses/base.response";
import { PermissoesConvidados } from "../../../models/perfis/perfis-permissoes.model";

export class ObterPerfisPermissoesConvidadosResponse extends BaseResponse {
  permissoes: PermissoesConvidados[];
}