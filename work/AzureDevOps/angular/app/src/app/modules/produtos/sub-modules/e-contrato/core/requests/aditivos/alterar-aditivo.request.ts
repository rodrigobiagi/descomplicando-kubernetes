import { MetadadoContrato } from "../../models/common/metadado-contrato.model";
import { ContratoComplementar } from "../../models/contratos/contrato-complementar.model";
import { Contrato } from "../../models/contratos/contrato.model";
import { Credor } from "../../models/contratos/credor.model";
import { Devedor } from "../../models/contratos/devedor.model";
import { Financiamento } from "../../models/contratos/financiamento.model";
import { Veiculo } from "../../models/contratos/veiculo.model";

export class AlterarAditivoRequest {
    metadadoContrato: MetadadoContrato;
    contrato: Contrato;
    veiculo: Veiculo[];
    credor: Credor;
    devedor: Devedor;
    financiamento: Financiamento;
    complementar: ContratoComplementar;

    constructor() {
        this.metadadoContrato = new MetadadoContrato();
        this.contrato = new Contrato();
        this.veiculo = new Array<Veiculo>();
        this.credor = new Credor();
        this.devedor = new Devedor();
        this.financiamento = new Financiamento();
        this.complementar = new ContratoComplementar();
    }
}