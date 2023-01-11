import { BaseResponse } from "src/app/core/responses/base.response";
import { StatusRegistroImagem } from "../../models/upload-imagens/status-registro-imagem.model";

export class ObterImagemStatusResponse extends BaseResponse {
  statusRegistroImagemMensagens: StatusRegistroImagem[];
}