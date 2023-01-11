import { RevisaoRegistroError } from "./revisao-registro-error";

export class RevisaoRegistroField {
    nome: string;
    nomeExibicao: string;
    valor?: string;
    erros?: RevisaoRegistroError[] = [];
    dataType: string;
    propertyName: string;

    constructor(nome: string, nomeExibicao: string, dataType: string, propertyName: string) {        
        this.nome = nome;
        this.nomeExibicao = nomeExibicao;
        this.dataType = dataType;
        this.propertyName = propertyName;
    }

    get possuiErro(): boolean {
        return this.erros.length > 0;
    }

    public addErro(codigo: string, mensagem: string): void {
        this.erros.push({ codigo: codigo, mensagem: mensagem });
    }
}