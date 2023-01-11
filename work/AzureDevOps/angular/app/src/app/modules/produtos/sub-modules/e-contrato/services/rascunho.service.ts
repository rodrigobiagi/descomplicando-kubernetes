import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { DadosRevisaoRascunho } from "../core/models/rascunhos/dados-revisao-rascunho.model";
import { RascunhoResumo } from "../core/models/rascunhos/rascunho-resumo.model";
import { AtualizarRascunhoComplementarRequest } from "../core/requests/rascunhos/atualizar-rascunho-complementar.request";
import { AtualizarRascunhoContratoRequest } from "../core/requests/rascunhos/atualizar-rascunho-contrato.request";
import { AtualizarRascunhoCredorRequest } from "../core/requests/rascunhos/atualizar-rascunho-credor.request";
import { AtualizarRascunhoDevedorRequest } from "../core/requests/rascunhos/atualizar-rascunho-develodr.request";
import { AtualizarRascunhoFinanciamentoRequest } from "../core/requests/rascunhos/atualizar-rascunho-financiamento.request";
import { AtualizarRascunhoVeiculoRequest } from "../core/requests/rascunhos/atualizar-rascunho-veiculo.request";
import { CriarRascunhoResumoRequest } from "../core/requests/rascunhos/criar-rascunho-resumo.request";
import { AtualizarRascunhoComplementarResponse } from "../core/responses/rascunhos/atualizar-rascunho-complementar.response";
import { AtualizarRascunhoContratoResponse } from "../core/responses/rascunhos/atualizar-rascunho-contrato.response";
import { AtualizarRascunhoDevedorResponse } from "../core/responses/rascunhos/atualizar-rascunho-devedor.response";
import { AtualizarRascunhoCredorResponse } from "../core/responses/rascunhos/atualizar-rascunho-credor.response";
import { AtualizarRascunhoFinanciamentoResponse } from "../core/responses/rascunhos/atualizar-rascunho-financiamento.response";
import { AtualizarRascunhoVeiculoResponse } from "../core/responses/rascunhos/atualizar-rascunho-veiculo.response";
import { CriarRascunhoResumoResponse } from "../core/responses/rascunhos/criar-rascunho-resumo.response";
import { ExcluirRascunhoResponse } from "../core/responses/rascunhos/excluir-rascunho.response";
import { ExcluirRascunhosResponse } from "../core/responses/rascunhos/excluir-rascunhos.response";
import { ObterRascunhoResumoPaginationResponse } from "../core/responses/rascunhos/obter-rascunho-resumo-pagination.response";
import { ObterRascunhoResumoResponse } from "../core/responses/rascunhos/obter-rascunho-resumo.response";
import { ObterRascunhoResponse } from "../core/responses/rascunhos/obter-rascunho.response";
import { ObterRevisaoRascunhoResponse } from "../core/responses/rascunhos/obter-revisao-rascunho.response";
import { IRascunhoService } from "./interfaces/rascunho.service";
import { AtualizarRascunhoTerceiroGarantidorResponse } from "../core/responses/rascunhos/atualizar-rascunho-terceiro-garantidor.response";
import { AtualizarRascunhoTerceiroGarantidorRequest } from "../core/requests/rascunhos/atualizar-rascunho-terceiro-garantidor.request";
import { TipoDetran } from "../core/enums/tipo-taxa-detran.enum";
import { RemoverVeiculoRascunhoResponse } from "../core/responses/rascunhos/remover-veiculo-rascunho.response";

@Injectable()
export class RascunhoService implements IRascunhoService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  atualizarRascunhoVeiculo(rascunho: AtualizarRascunhoVeiculoRequest, identifier: string): Observable<AtualizarRascunhoVeiculoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/veiculo`;

    return this.http.put<AtualizarRascunhoVeiculoResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoVeiculoResponse(data)));
  }

  atualizarRascunhoContrato(rascunho: AtualizarRascunhoContratoRequest, identifier: string): Observable<AtualizarRascunhoContratoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/contrato`;

    return this.http.put<AtualizarRascunhoContratoResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoContratoResponse(data)));
  }

  atualizarRascunhoComplementar(rascunho: AtualizarRascunhoComplementarRequest, identifier: string): Observable<AtualizarRascunhoComplementarResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/complementar`;

    return this.http.put<AtualizarRascunhoComplementarResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoComplementarResponse(data)));
  }

  atualizarRascunhoFinanciamento(rascunho: AtualizarRascunhoFinanciamentoRequest, identifier: string): Observable<AtualizarRascunhoFinanciamentoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/financiamento`;

    return this.http.put<AtualizarRascunhoFinanciamentoResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoFinanciamentoResponse(data)));
  }

  atualizarRascunhoCredor(rascunho: AtualizarRascunhoCredorRequest, identifier: string): Observable<AtualizarRascunhoCredorResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/credor`;

    return this.http.put<AtualizarRascunhoCredorResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoCredorResponse(data)));
  }

  atualizarRascunhoDevedor(rascunho: AtualizarRascunhoDevedorRequest, identifier: string): Observable<AtualizarRascunhoDevedorResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/devedor`;

    return this.http.put<AtualizarRascunhoDevedorResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoDevedorResponse(data)));
  }

  atualizarRascunhoTerceiroGarantidor(rascunho: AtualizarRascunhoTerceiroGarantidorRequest, identifier: string): Observable<AtualizarRascunhoTerceiroGarantidorResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/terceiro-garantidor`;

    return this.http.put<AtualizarRascunhoTerceiroGarantidorResponse>(url, rascunho)
      .pipe(map(data => this.transformToAtualizarRascunhoTerceiroGarantidorResponse(data)));
  }

  criarRascunhoResumo(rascunho: CriarRascunhoResumoRequest): Observable<CriarRascunhoResumoResponse> {
    let url = this.appSettings.baseUrlApi + 'rascunhos-contrato';

    return this.http.post<CriarRascunhoResumoResponse>(url, rascunho)
      .pipe(map(data => this.transformToCriarRascunhoResumoResponse(data)));
  }

  excluirRascunho(identifier: string): Observable<boolean> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    return this.http.delete(url)
      .pipe(map((data: ExcluirRascunhoResponse) => {
        return data.isSuccessful ? true : false
      }));
  }

  excluirRascunhos(identifierList: Array<string>): Observable<boolean> {
    let url = `${this.appSettings.baseUrlApi}rascunhos-contrato/`;

    return this.http.delete(url, { body: identifierList })
      .pipe(map((data: ExcluirRascunhosResponse) => {
        return data.isSuccessful ? true : false
      }));
  }

  obterRascunho(identifier: string): Observable<ObterRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    return this.http.get<ObterRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRascunhoResponse(data)));
  }

  obterRascunhoResumo(identifier: string): Observable<ObterRascunhoResumoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'ufLicenciamento,numeroContrato,operacaoId,tipoFormulario,protocoloOrigem,ehFrota');

    return this.http.get<ObterRascunhoResumoResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterRascunhoResumoResponse(data)));
  }

  obterRascunhoVeiculo(identifier: string): Observable<AtualizarRascunhoVeiculoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'veiculo');

    return this.http.get<AtualizarRascunhoVeiculoResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoVeiculoResponse(data)));
  }

  obterRascunhoContrato(identifier: string): Observable<AtualizarRascunhoContratoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'contrato');

    return this.http.get<AtualizarRascunhoContratoResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoContratoResponse(data)));
  }

  obterRascunhoCredor(identifier: string): Observable<AtualizarRascunhoCredorResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'credor');

    return this.http.get<AtualizarRascunhoCredorResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoCredorResponse(data)));
  }

  obterRascunhoDevedor(identifier: string): Observable<AtualizarRascunhoDevedorResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'devedor');

    return this.http.get<AtualizarRascunhoDevedorResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoDevedorResponse(data)));
  }

  obterRascunhoComplementar(identifier: string): Observable<AtualizarRascunhoComplementarResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'complementar');

    return this.http.get<AtualizarRascunhoComplementarResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoComplementarResponse(data)));
  }

  obterRascunhoFinanciamento(identifier: string): Observable<AtualizarRascunhoFinanciamentoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'financiamento');

    return this.http.get<AtualizarRascunhoFinanciamentoResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoFinanciamentoResponse(data)));
  }

  obterRascunhoTerceiroGarantidor(identifier: string): Observable<AtualizarRascunhoTerceiroGarantidorResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}`;

    const params = new HttpParams()
      .set('fields', 'garantidor');

    return this.http.get<AtualizarRascunhoTerceiroGarantidorResponse>(url, { params: params })
      .pipe(map(data => this.transformToAtualizarRascunhoTerceiroGarantidorResponse(data)));
  }

  obterRascunhosResumo(pageIndex: number, pageSize: number): Observable<ObterRascunhoResumoPaginationResponse> {
    let url = this.appSettings.baseUrlApi + 'rascunhos-contrato';

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    return this.http.get<ObterRascunhoResumoPaginationResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterRascunhosResumoResponse(data)));
  }

  obterRevisaoRascunhoVeiculo(identifier: string): Observable<ObterRevisaoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/revisao-veiculo`;

    return this.http.get<ObterRevisaoRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRevisaoRascunhoResponse(data)));
  }

  obterRevisaoRascunhoContrato(identifier: string): Observable<ObterRevisaoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/revisao-contrato`;

    return this.http.get<ObterRevisaoRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRevisaoRascunhoResponse(data)));
  }

  obterRevisaoRascunhoComplementar(identifier: string): Observable<ObterRevisaoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/revisao-complementar`;

    return this.http.get<ObterRevisaoRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRevisaoRascunhoResponse(data)));
  }

  obterRevisaoRascunhoFinanciamento(identifier: string): Observable<ObterRevisaoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/revisao-financiamento`;

    return this.http.get<ObterRevisaoRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRevisaoRascunhoResponse(data)));
  }

  obterRevisaoRascunhoCredor(identifier: string): Observable<ObterRevisaoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/revisao-credor`;

    return this.http.get<ObterRevisaoRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRevisaoRascunhoResponse(data)));
  }

  obterRevisaoRascunhoDevedor(identifier: string): Observable<ObterRevisaoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/revisao-devedor`;

    return this.http.get<ObterRevisaoRascunhoResponse>(url)
      .pipe(map(data => this.transformToObterRevisaoRascunhoResponse(data)));
  }

  removerVeiculoRascunho(identifier: string, veiculo: any): Observable<RemoverVeiculoRascunhoResponse> {
    let url = this.appSettings.baseUrlApi + `rascunhos-contrato/${identifier}/veiculo`;

    return this.http.delete<RemoverVeiculoRascunhoResponse>(url, { body: veiculo })
      .pipe(map(data => this.transformToRemoverVeiculoRascunhoResponse(data)));
  }

  private transformToAtualizarRascunhoVeiculoResponse(data: any): AtualizarRascunhoVeiculoResponse {
    let response: AtualizarRascunhoVeiculoResponse = new AtualizarRascunhoVeiculoResponse();

    if (data.isSuccessful) {
      response.veiculo = data.result.veiculo;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToAtualizarRascunhoContratoResponse(data: any): AtualizarRascunhoContratoResponse {
    let response: AtualizarRascunhoContratoResponse = new AtualizarRascunhoContratoResponse();

    if (data.isSuccessful) {
      response.numeroRestricao = data.result.contrato?.numeroRestricao;
      response.tipoRestricao = data.result.contrato?.tipoRestricao;
      response.dataContrato = data.result.contrato?.dataContrato;
      response.numeroTaxaDetran = data.result.contrato?.numeroTaxaDetran;
      response.numeroAditivo = data.result.contrato?.numeroAditivo;
      response.dataAditivo = data.result.contrato?.dataAditivo;
      response.tipoAditivo = data.result.contrato?.tipoAditivo;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToAtualizarRascunhoComplementarResponse(data: any): AtualizarRascunhoComplementarResponse {
    let response: AtualizarRascunhoComplementarResponse = new AtualizarRascunhoComplementarResponse();

    if (data.isSuccessful) {

      response.indice = data.result.complementar?.indice;
      response.taxaContrato = data.result.complementar?.taxaContrato;
      response.taxaIof = data.result.complementar?.taxaIof;
      response.taxaJurosMes = data.result.complementar?.taxaJurosMes;
      response.taxaJurosAno = data.result.complementar?.taxaJurosAno;
      response.valorTaxaMora = data.result.complementar?.valorTaxaMora;
      response.valorTaxaMulta = data.result.complementar?.valorTaxaMulta;
      response.comissao = data.result.complementar?.comissao;
      response.nomeRecebedorPagamento = data.result.complementar?.nomeRecebedorPagamento;
      response.documentoRecebedor.tipoDocumento = data.result.complementar?.documentoRecebedor?.tipoDocumento
        ? data.result.complementar?.documentoRecebedor?.tipoDocumento
        : 1;
      response.documentoRecebedor.numero = data.result.complementar?.documentoRecebedor?.numero;
      response.documentoVendedor.tipoDocumento = data.result.complementar?.documentoVendedor?.tipoDocumento
        ? data.result.complementar?.documentoVendedor?.tipoDocumento
        : 1;
      response.documentoVendedor.numero = data.result.complementar?.documentoVendedor?.numero;
      response.indicadorTaxaMora = data.result.complementar?.indicadorTaxaMora;
      response.indicadorTaxaMulta = data.result.complementar?.indicadorTaxaMulta;
      response.indicadorComissao = data.result.complementar?.indicadorComissao;
      response.indicadorPenalidade = data.result.complementar?.indicadorPenalidade;
      response.penalidade = data.result.complementar?.penalidade;
      response.comentario = data.result.complementar?.comentario;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToAtualizarRascunhoFinanciamentoResponse(data: any): AtualizarRascunhoFinanciamentoResponse {
    let response: AtualizarRascunhoFinanciamentoResponse = new AtualizarRascunhoFinanciamentoResponse();

    if (data.isSuccessful) {
      response.valorTotalDivida = data.result.financiamento?.valorTotalDivida;
      response.valorParcela = data.result.financiamento?.valorParcela;
      response.quantidadeParcela = data.result.financiamento?.quantidadeParcela;
      response.dataVencimentoPrimeiraParcela = data.result.financiamento?.dataVencimentoPrimeiraParcela;
      response.dataVencimentoUltimaParcela = data.result.financiamento?.dataVencimentoUltimaParcela;
      response.liberacaoCredito.data = data.result.financiamento?.liberacaoCredito.data;
      response.liberacaoCredito.uf = data.result.financiamento?.liberacaoCredito.uf;
      response.municipioLiberacaoCredito = data.result.financiamento?.municipioLiberacaoCredito;
      response.consorcio.cota = data.result.financiamento?.consorcio.cota;
      response.consorcio.grupo = data.result.financiamento?.consorcio.grupo;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToAtualizarRascunhoCredorResponse(data: any): AtualizarRascunhoCredorResponse {
    let response: AtualizarRascunhoCredorResponse = new AtualizarRascunhoCredorResponse();

    if (data.isSuccessful) {

      response.id = data.result.credor?.agenteFinanceiroId;
      response.agenteFinanceiroId = data.result.credor.agenteFinanceiroId;
      response.nomeAgenteFinanceiro = data.result.credor?.nomeAgenteFinanceiro;
      response.codigoAgenteFinanceiro = data.result.credor?.codigoAgenteFinanceiro;
      response.documento.tipoDocumento = data.result.credor?.documento.tipoDocumento;
      response.documento.numero = data.result.credor?.documento.numero;
      response.endereco.logradouro = data.result.credor?.endereco?.logradouro;
      response.endereco.numero = data.result.credor?.endereco?.numero;
      response.endereco.bairro = data.result.credor?.endereco?.bairro;
      response.endereco.municipio = data.result.credor?.endereco?.municipio;
      response.endereco.complemento = data.result.credor?.endereco?.complemento;
      response.endereco.uf = data.result.credor?.endereco?.uf;
      response.endereco.cep = data.result.credor?.endereco?.cep;
      response.contato.ddd = data.result.credor?.contato?.ddd;
      response.contato.telefone = data.result.credor?.contato?.telefone;
      response.contato.email = data.result.credor?.contato?.email;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToAtualizarRascunhoDevedorResponse(data: any): AtualizarRascunhoDevedorResponse {
    let response: AtualizarRascunhoDevedorResponse = new AtualizarRascunhoDevedorResponse();

    if (data.isSuccessful) {

      response.nomeDoFinanciado = data.result.devedor?.nomeDoFinanciado;
      response.documento.tipoDocumento = data.result.devedor?.documento?.tipoDocumento
        ? data.result.devedor?.documento?.tipoDocumento
        : 1;
      response.documento.numero = data.result.devedor?.documento?.numero;
      response.endereco.logradouro = data.result.devedor?.endereco?.logradouro;
      response.endereco.numero = data.result.devedor?.endereco?.numero;
      response.endereco.bairro = data.result.devedor?.endereco?.bairro;
      response.endereco.municipio = data.result.devedor?.endereco?.municipio;
      response.endereco.complemento = data.result.devedor?.endereco?.complemento;
      response.endereco.uf = data.result.devedor?.endereco?.uf;
      response.endereco.cep = data.result.devedor?.endereco?.cep;
      response.contato.ddd = data.result.devedor?.contato?.ddd;
      response.contato.telefone = data.result.devedor?.contato?.telefone;
      response.contato.email = data.result.devedor?.contato?.email;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToAtualizarRascunhoTerceiroGarantidorResponse(data: any): AtualizarRascunhoTerceiroGarantidorResponse {
    let response: AtualizarRascunhoTerceiroGarantidorResponse = new AtualizarRascunhoTerceiroGarantidorResponse();

    if (data.isSuccessful) {

      response.nomeTerceiroGarantidor = data.result.Garantidor?.nomeTerceiroGarantidor;
      response.documento.tipoDocumento = data.result.Garantidor?.documento.tipoDocumento;
      response.documento.numero = data.result.Garantidor?.documento.numero;
      response.endereco.logradouro = data.result.Garantidor?.endereco.logradouro;
      response.endereco.numero = data.result.Garantidor?.endereco.numero;
      response.endereco.bairro = data.result.Garantidor?.endereco.bairro;
      response.endereco.municipio = data.result.Garantidor?.endereco.municipio;
      response.endereco.complemento = data.result.Garantidor?.endereco.complemento;
      response.endereco.uf = data.result.Garantidor?.endereco.uf;
      response.endereco.cep = data.result.Garantidor?.endereco.cep;
      response.contato.ddd = data.result.Garantidor?.contato.ddd;
      response.contato.telefone = data.result.Garantidor?.contato.telefone;
      response.contato.email = data.result.Garantidor?.contato.email;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToCriarRascunhoResumoResponse(data: any): CriarRascunhoResumoResponse {
    let response: CriarRascunhoResumoResponse = new CriarRascunhoResumoResponse();


    if (data.isSuccessful) {

      response.identifier = data.result.identifier;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterRascunhoResponse(data: any): ObterRascunhoResponse {
    let response: ObterRascunhoResponse = new ObterRascunhoResponse();

    if (data.isSuccessful) {

      response.identifier = data.result.identifier;
      response.operacaoId = data.result.operacaoId;
      response.tipoFormulario = data.result.tipoFormulario;
      response.veiculo = data.result.veiculo;
      response.protocoloOrigem = data.result.protocoloOrigem;
      response.ufLicenciamento = data.result.ufLicenciamento;

      response.contrato.numeroContrato = data.result.contrato?.numeroContrato;
      response.contrato.numeroRestricao = data.result.contrato?.numeroRestricao;
      response.contrato.tipoRestricao = data.result.contrato?.tipoRestricao;
      response.contrato.dataContrato = data.result.contrato?.dataContrato;
      response.contrato.taxaDetran.numero = data.result.contrato?.numeroTaxaDetran;
      response.contrato.taxaDetran.tipoTaxaDetran = data.result.ufLicenciamento == 'RJ' ? TipoDetran.Duda : null;
      response.contrato.numeroAditivo = data.result.contrato?.numeroAditivo;
      response.contrato.dataAditivo = data.result.contrato?.dataAditivo;
      response.contrato.tipoAditivo = data.result.contrato?.tipoAditivo;
      response.contrato.ufLicenciamento = data.result?.ufLicenciamento;
      response.contrato.ehFrota = data.result?.ehFrota;

      response.complementar.taxaContrato = data.result.complementar?.taxaContrato;
      response.complementar.taxaIof = data.result.complementar?.taxaIof;
      response.complementar.indice = data.result.complementar?.indice;
      response.complementar.indicadorTaxaMora = data.result.complementar?.indicadorTaxaMora;
      response.complementar.valorTaxaMora = data.result.complementar?.valorTaxaMora;
      response.complementar.indicadorPenalidade = data.result.complementar?.indicadorPenalidade;
      response.complementar.penalidade = data.result.complementar?.penalidade;
      response.complementar.indicadorTaxaMulta = data.result.complementar?.indicadorTaxaMulta;
      response.complementar.valorTaxaMulta = data.result.complementar?.valorTaxaMulta;
      response.complementar.taxaJurosAno = data.result.complementar?.taxaJurosAno;
      response.complementar.taxaJurosMes = data.result.complementar?.taxaJurosMes;
      response.complementar.indicadorComissao = data.result.complementar?.indicadorComissao;
      response.complementar.comissao = data.result.complementar?.comissao;
      response.complementar.nomeRecebedorPagamento = data.result.complementar?.nomeRecebedorPagamento;
      response.complementar.documentoRecebedor = data.result.complementar?.documentoRecebedor;
      response.complementar.documentoVendedor = data.result.complementar?.documentoVendedor;
      response.complementar.comentario = data.result.complementar?.comentario;

      response.financiamento.valorTotalDivida = data.result.financiamento?.valorTotalDivida;
      response.financiamento.valorParcela = data.result.financiamento?.valorParcela;
      response.financiamento.quantidadeParcela = data.result.financiamento?.quantidadeParcela;
      response.financiamento.dataVencimentoPrimeiraParcela = data.result.financiamento?.dataVencimentoPrimeiraParcela;
      response.financiamento.dataVencimentoUltimaParcela = data.result.financiamento?.dataVencimentoUltimaParcela;
      response.financiamento.liberacaoCredito.data = data.result.financiamento?.liberacaoCredito.data;
      response.financiamento.liberacaoCredito.uf = data.result.financiamento?.liberacaoCredito.uf;
      response.financiamento.idMunicipio = data.result.financiamento?.idMunicipio;
      response.financiamento.consorcio.cota = data.result.financiamento?.consorcio.cota;
      response.financiamento.consorcio.grupo = data.result.financiamento?.consorcio.grupo;

      response.credor.empresaId = data.result.credor?.agenteFinanceiroId;
      response.credor.agenteFinanceiro = data.result.credor?.agenteFinanceiroId;
      response.credor.documento.numero = data.result.credor?.documento.numero;
      response.credor.documento.tipoDocumento = data.result.credor?.documento.tipoDocumento;
      response.credor.contato.ddd = data.result.credor?.contato?.ddd;
      response.credor.contato.telefone = data.result.credor?.contato?.telefone;
      response.credor.contato.email = data.result.credor?.contato?.email;
      response.credor.endereco.logradouro = data.result.credor?.endereco?.logradouro;
      response.credor.endereco.numero = data.result.credor?.endereco?.numero;
      response.credor.endereco.bairro = data.result.credor?.endereco?.bairro;
      response.credor.endereco.municipio = data.result.credor?.endereco?.municipio;
      response.credor.endereco.cep = data.result.credor?.endereco?.cep;
      response.credor.endereco.complemento = data.result.credor?.endereco?.complemento;
      response.credor.endereco.uf = data.result.credor?.endereco?.uf;
      response.credor.endereco.codigoMunicipio = data.result.credor?.endereco?.codigoMunicipio;
      response.credor.codigoAgenteFinanceiro = data.result.credor?.codigoAgenteFinanceiro;
      response.credor.nomeAgenteFinanceiro = data.result.credor?.nomeAgenteFinanceiro;

      response.devedor.nomeDoFinanciado = data.result.devedor?.nomeDoFinanciado;
      response.devedor.documento.numero = data.result.devedor?.documento?.numero;
      response.devedor.documento.tipoDocumento = data.result.devedor?.documento?.tipoDocumento;
      response.devedor.contato.ddd = data.result.devedor?.contato?.ddd;
      response.devedor.contato.telefone = data.result.devedor?.contato?.telefone;
      response.devedor.contato.email = data.result.devedor?.contato?.email;
      response.devedor.endereco.logradouro = data.result.devedor?.endereco?.logradouro;
      response.devedor.endereco.numero = data.result.devedor?.endereco?.numero;
      response.devedor.endereco.bairro = data.result.devedor?.endereco?.bairro;
      response.devedor.endereco.municipio = data.result.devedor?.endereco?.municipio;
      response.devedor.endereco.cep = data.result.devedor?.endereco?.cep;
      response.devedor.endereco.complemento = data.result.devedor?.endereco?.complemento;
      response.devedor.endereco.uf = data.result.devedor?.endereco?.uf;
      response.devedor.endereco.codigoMunicipio = data.result.devedor?.endereco?.codigoMunicipio;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterRascunhoResumoResponse(data: any): ObterRascunhoResumoResponse {
    let response: ObterRascunhoResumoResponse = new ObterRascunhoResumoResponse();

    if (data.isSuccessful) {
      response.rascunho.numeroContrato = data.result.numeroContrato;
      response.rascunho.ufLicenciamento = data.result.ufLicenciamento;
      response.rascunho.operacaoId = data.result.operacaoId;
      response.rascunho.tipoFormulario = data.result.tipoFormulario;
      response.rascunho.protocoloOrigem = data.result.protocoloOrigem;
      response.rascunho.ehFrota = data.result.ehFrota;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterRascunhosResumoResponse(data: any): ObterRascunhoResumoPaginationResponse {
    let response: ObterRascunhoResumoPaginationResponse = new ObterRascunhoResumoPaginationResponse();

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;

      data.result.rascunhos.forEach((rascunho: RascunhoResumo) => {
        response.rascunhos.push(rascunho);
      })

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterRevisaoRascunhoResponse(data: any): ObterRevisaoRascunhoResponse {
    let response: ObterRevisaoRascunhoResponse = new ObterRevisaoRascunhoResponse();

    if (data.isSuccessful) {
      response.categoria = data.result.categoria;

      data.result.dadosRevisaoRascunho.forEach((revisao: DadosRevisaoRascunho) => {
        response.dadosRevisaoRascunho.push(revisao);
      });

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToRemoverVeiculoRascunhoResponse(data: any): RemoverVeiculoRascunhoResponse {
    let response: RemoverVeiculoRascunhoResponse = new RemoverVeiculoRascunhoResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); })
    return response;
  }
}