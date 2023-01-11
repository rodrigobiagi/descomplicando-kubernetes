import { BaseResponse } from "src/app/core/responses/base.response";
import { Grupo } from "../models/perfis/grupo.model";

export class ObterPerfilResponse extends BaseResponse {
    id: number;
    empresaId: number;
    nome: string;
    descricao: string;
    convidado: boolean;
    ativo: boolean;
    grupos: Grupo[];
}