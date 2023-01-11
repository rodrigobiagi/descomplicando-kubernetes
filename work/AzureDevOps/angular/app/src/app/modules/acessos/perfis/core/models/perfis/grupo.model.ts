import { Permissao } from "./permissao.model";

export class Grupo {
    id: number;
    nome: string;
    permissoes: Permissao[];
    expanded?: boolean;
}