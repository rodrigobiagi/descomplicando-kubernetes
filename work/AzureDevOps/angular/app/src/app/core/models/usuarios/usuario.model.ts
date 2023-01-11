import { NomeUsuario } from "./nome-usuario.model";

export class Usuario {
    id?: string;
    email?: string;
    nome?: NomeUsuario;
    empresaId?: number;

    constructor(id: string, nome: string, sobrenome: string, email: string, empresaId: number) {
        this.id = id;
        this.email = email;
        this.nome = new NomeUsuario(nome, sobrenome)
        this.empresaId = empresaId
    }
}
