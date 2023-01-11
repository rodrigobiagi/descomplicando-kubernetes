import { Grupo } from "../models/perfis/grupo.model";

export class CriarPerfilRequest {
    empresaId: number;
    nome: string;
    descricao: string;
    convidado: boolean;
    ativo: boolean;
    grupoPermissoes: Grupo[];
}