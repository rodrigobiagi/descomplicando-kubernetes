import { ContratoComplementar } from "../contratos/contrato-complementar.model";
import { Contrato } from "../contratos/contrato.model";
import { Credor } from "../contratos/credor.model";
import { Devedor } from "../contratos/devedor.model";
import { Financiamento } from "../contratos/financiamento.model";
import { Veiculo } from "../contratos/veiculo.model";

export class Rascunho {    
    contrato: Contrato;
    complementar: ContratoComplementar;
    veiculo: Veiculo[];
    credor: Credor;
    devedor: Devedor;
    financiamento: Financiamento;

    constructor() {
        this.contrato = new Contrato();
        this.complementar = new ContratoComplementar();
        this.veiculo = new Array<Veiculo>();
        this.credor = new Credor();
        this.devedor = new Devedor();
        this.financiamento = new Financiamento();
    }
}