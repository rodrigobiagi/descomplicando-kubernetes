import { Contato } from "../common/contato.model";
import { Documento } from "../common/documento.model";
import { Endereco } from "../common/endereco.model";

export interface IAgenteFinanceiro {
    id: number;
    nome: string;
    documento: Documento;
    endereco: Endereco;
    contato: Contato;
}