import { BaseResponse } from "src/app/core/responses/base.response";
import { Permissao } from "src/app/modules/acessos/perfis/core/models/perfis/permissao.model";

export class ObterPerrmissoesUsuarioResponse extends BaseResponse {
  permissoes: Permissao[];
}