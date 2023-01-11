import { MetadadoContrato } from "../../models/common/metadado-contrato.model";
import { ContratoComplementar } from "../../models/contratos/contrato-complementar.model";
import { Contrato } from "../../models/contratos/contrato.model";
import { Credor } from "../../models/contratos/credor.model";
import { Devedor } from "../../models/contratos/devedor.model";
import { Financiamento } from "../../models/contratos/financiamento.model";
import { Veiculo } from "../../models/contratos/veiculo.model";

export class RegistrarContratoRequest {
    metadadoContrato: MetadadoContrato;
    contrato: Contrato;
    complementar: ContratoComplementar;
    veiculo: Veiculo[];
    financiamento: Financiamento;
    credor: Credor;
    devedor: Devedor;  

    constructor() {
        this.metadadoContrato = new MetadadoContrato();
        this.contrato = new Contrato();
        this.complementar = new ContratoComplementar();
        this.veiculo = new Array<Veiculo>();
        this.financiamento = new Financiamento();
        this.credor = new Credor();
        this.devedor = new Devedor();
    }
}