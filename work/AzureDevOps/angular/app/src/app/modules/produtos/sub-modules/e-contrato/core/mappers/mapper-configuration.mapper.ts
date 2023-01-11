import { CanalDeServico } from "src/app/core/enums/canal-servico.enum";
import { ContratoComplementar } from "../models/contratos/contrato-complementar.model";
import { Contrato } from "../models/contratos/contrato.model";
import { Credor } from "../models/contratos/credor.model";
import { Devedor } from "../models/contratos/devedor.model";
import { Financiamento } from "../models/contratos/financiamento.model";
import { Veiculo } from "../models/contratos/veiculo.model";
import { Rascunho } from "../models/rascunhos/rascunho.model";
import { AlterarAditivoRequest } from "../requests/aditivos/alterar-aditivo.request";
import { AlterarContratoRequest } from "../requests/contratos/alterar-contrato.request";
import { RegistrarContratoRequest } from "../requests/contratos/registrar-contrato.request";
import { RegistrarAditivoRequest } from "../requests/contratos/registrar-aditivo.request";

export class MapperConfigurationEContrato {

  public static toRegistrarContratoRequest(rascunho: Rascunho): RegistrarContratoRequest {
    let registrarContratoRequest = new RegistrarContratoRequest();

    registrarContratoRequest.metadadoContrato.canalServico = CanalDeServico.web;

    this.toContrato(registrarContratoRequest.contrato, rascunho);
    this.toComplementar(registrarContratoRequest.complementar, rascunho);
    this.toVeiculo(registrarContratoRequest.veiculo, rascunho);
    this.toCredor(registrarContratoRequest.credor, rascunho);
    this.toDevedor(registrarContratoRequest.devedor, rascunho);
    this.toFinanciamento(registrarContratoRequest.financiamento, rascunho);

    return registrarContratoRequest;
  }

  public static toRegistrarAditivoRequest(rascunho: Rascunho): RegistrarAditivoRequest {
    let registrarAditivoRequest = new RegistrarAditivoRequest();

    registrarAditivoRequest.metadadoContrato.canalServico = CanalDeServico.web;

    this.toContrato(registrarAditivoRequest.contrato, rascunho);
    this.toComplementar(registrarAditivoRequest.complementar, rascunho);
    this.toVeiculo(registrarAditivoRequest.veiculo, rascunho);
    this.toCredor(registrarAditivoRequest.credor, rascunho);
    this.toDevedor(registrarAditivoRequest.devedor, rascunho);
    this.toFinanciamento(registrarAditivoRequest.financiamento, rascunho);

    return registrarAditivoRequest;
  }

  public static toAlterarContratoRequest(rascunho: Rascunho): AlterarContratoRequest {
    let alterarContratoRequest = new AlterarContratoRequest();

    alterarContratoRequest.metadadoContrato.canalServico = CanalDeServico.web;

    this.toContrato(alterarContratoRequest.contrato, rascunho);
    this.toComplementar(alterarContratoRequest.complementar, rascunho);
    this.toVeiculo(alterarContratoRequest.veiculo, rascunho);
    this.toCredor(alterarContratoRequest.credor, rascunho);
    this.toDevedor(alterarContratoRequest.devedor, rascunho);
    this.toFinanciamento(alterarContratoRequest.financiamento, rascunho);

    return alterarContratoRequest;
  }

  public static toAlterarAditivoRequest(rascunho: Rascunho): AlterarAditivoRequest {
    let alterarAditivoRequest = new AlterarAditivoRequest();

    alterarAditivoRequest.metadadoContrato.canalServico = CanalDeServico.web;

    this.toContrato(alterarAditivoRequest.contrato, rascunho);
    this.toComplementar(alterarAditivoRequest.complementar, rascunho);
    this.toVeiculo(alterarAditivoRequest.veiculo, rascunho);
    this.toCredor(alterarAditivoRequest.credor, rascunho);
    this.toDevedor(alterarAditivoRequest.devedor, rascunho);
    this.toFinanciamento(alterarAditivoRequest.financiamento, rascunho);

    return alterarAditivoRequest;
  }

  private static toContrato(contrato: Contrato, rascunho: Rascunho) {
    contrato.numeroContrato = rascunho.contrato.numeroContrato;
    contrato.tipoRestricao = rascunho.contrato.tipoRestricao;
    contrato.ufLicenciamento = rascunho.contrato.ufLicenciamento;
    contrato.dataContrato = rascunho.contrato.dataContrato;
    contrato.taxaDetran = rascunho.contrato.taxaDetran;
    contrato.numeroAditivo = rascunho.contrato.numeroAditivo;
    contrato.dataAditivo = rascunho.contrato.dataAditivo;
    contrato.tipoAditivo = rascunho.contrato.tipoAditivo == 0 ? null : rascunho.contrato.tipoAditivo;
    contrato.ehFrota = rascunho.contrato.ehFrota;
  }

  private static toComplementar(complementar: ContratoComplementar, rascunho: Rascunho) {
    complementar.taxaContrato = rascunho.complementar.taxaContrato;
    complementar.taxaIof = rascunho.complementar.taxaIof;
    complementar.indice = rascunho.complementar.indice;
    complementar.indicadorTaxaMora = rascunho.complementar.indicadorTaxaMora;
    complementar.valorTaxaMora = rascunho.complementar.valorTaxaMora;
    complementar.indicadorTaxaMulta = rascunho.complementar.indicadorTaxaMulta;
    complementar.valorTaxaMulta = rascunho.complementar.valorTaxaMulta;
    complementar.taxaJurosMes = rascunho.complementar.taxaJurosMes;
    complementar.taxaJurosAno = rascunho.complementar.taxaJurosAno;
    complementar.indicadorComissao = rascunho.complementar.indicadorComissao;
    complementar.comissao = rascunho.complementar.comissao;
    complementar.indicadorPenalidade = rascunho.complementar.indicadorPenalidade;
    complementar.penalidade = rascunho.complementar.penalidade;
    complementar.nomeRecebedorPagamento = rascunho.complementar.nomeRecebedorPagamento;
    complementar.documentoRecebedor = rascunho.complementar.documentoRecebedor;
    complementar.documentoVendedor = rascunho.complementar.documentoVendedor;
    complementar.comentario = rascunho.complementar.comentario;
  }

  private static toVeiculo(veiculo: Veiculo[], rascunho: Rascunho) {
    for (let i = 0; i < rascunho.veiculo.length; i++) {
      veiculo.push(<Veiculo>{
        chassi: rascunho.veiculo[i].chassi,
        placa: rascunho.veiculo[i].placa,
        ufPlaca: rascunho.veiculo[i].ufPlaca,
        anoFabricacao: rascunho.veiculo[i].anoFabricacao,
        anoModelo: rascunho.veiculo[i].anoModelo,
        renavam: rascunho.veiculo[i].renavam,
        numeroRestricao: rascunho.veiculo[i].numeroRestricao,
        marca: rascunho.veiculo[i].marca,
        modelo: rascunho.veiculo[i].modelo,
        emplacado: rascunho.veiculo[i].emplacado,
        remarcado: rascunho.veiculo[i].remarcado,
        especie: rascunho.veiculo[i].especie == 0 ? null : rascunho.veiculo[i].especie,
        cor: rascunho.veiculo[i].cor
      })
    }
  }

  private static toCredor(credor: Credor, rascunho: Rascunho) {
    credor.agenteFinanceiro = rascunho.credor.agenteFinanceiro;
    credor.empresaId = rascunho.credor.empresaId;
    credor.codigoAgenteFinanceiro = rascunho.credor.codigoAgenteFinanceiro;
    credor.nomeAgenteFinanceiro = rascunho.credor.nomeAgenteFinanceiro;
    credor.documento = rascunho.credor.documento;
    credor.endereco = rascunho.credor.endereco;
    credor.contato = rascunho.credor.contato;
  }

  private static toDevedor(devedor: Devedor, rascunho: Rascunho) {
    devedor.nomeDoFinanciado = rascunho.devedor.nomeDoFinanciado;
    devedor.documento = rascunho.devedor.documento;
    devedor.endereco = rascunho.devedor.endereco;
    devedor.contato = rascunho.devedor.contato;
  }

  private static toFinanciamento(financiamento: Financiamento, rascunho: Rascunho) {
    financiamento.valorTotalDivida = rascunho.financiamento.valorTotalDivida;
    financiamento.valorParcela = rascunho.financiamento.valorParcela;
    financiamento.quantidadeParcela = rascunho.financiamento.quantidadeParcela;
    financiamento.dataVencimentoPrimeiraParcela = rascunho.financiamento.dataVencimentoPrimeiraParcela;
    financiamento.dataVencimentoUltimaParcela = rascunho.financiamento.dataVencimentoUltimaParcela;
    financiamento.liberacaoCredito = rascunho.financiamento.liberacaoCredito;
    financiamento.consorcio = rascunho.financiamento.consorcio;
    financiamento.idMunicipio = rascunho.financiamento.idMunicipio;
  }
}