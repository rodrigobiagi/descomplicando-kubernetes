import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { DetalheGravame } from "src/app/core/models/gravame/detalhe-gravame.model";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { Veiculo } from "../core/models/contratos/veiculo.model";
import { DadosInconsistenciasContrato } from "../core/models/inconsistencias-contrato/dados-inconsistencias-contrato.model";
import { AlterarContratoRequest } from "../core/requests/contratos/alterar-contrato.request";
import { CancelarBaixarContratoRequest } from "../core/requests/contratos/cancelar-baixar-contrato.request";
import { ConsultarContratoRequest } from "../core/requests/contratos/consultar-contrato.request";
import { RegistrarContratoRequest } from "../core/requests/contratos/registrar-contrato.request";
import { RegistrarImagemRequest } from "../core/requests/contratos/registrar-imagem.request";
import { AlterarContratoResponse } from "../core/responses/contratos/alterar-contrato.response";
import { AssociarImagemContratoResponse } from "../core/responses/contratos/associar-imagem-contrato.response";
import { BaixarInconsistenciaImagemResponse } from "../core/responses/contratos/baixar-inconsistencia-imagem.response";
import { CancelarBaixarContratoResponse } from "../core/responses/contratos/cancelar-baixar-contrato.response";
import { ConsultarContratoVeiculoResponse } from "../core/responses/contratos/consultar-contrato-veiculo.response";
import { ConsultarContratoResponse } from "../core/responses/contratos/consultar-contrato.response";
import { ConsultarGravameResponse } from "../core/responses/contratos/consultar-gravame.response";
import { EnviarImagemResponse } from "../core/responses/contratos/enviar-imagem.response";
import { GravameResponse } from "../core/responses/contratos/gravame.response";
import { ObterImagemRevisaoResponse } from "../core/responses/contratos/obter-imagem-revisao.response";
import { ObterImagemStatusResponse } from "../core/responses/contratos/obter-imagem-status.response";
import { ObterImagemResponse } from "../core/responses/contratos/obter-imagem.response";
import { ReenvioContratoResponse } from "../core/responses/contratos/reenvio-contrato.response";
import { RegistrarContratoResponse } from "../core/responses/contratos/registrar-contrato.response";
import { ObterInconsistenciasContratoResponse } from "../core/responses/contratos/visualizar-inconsistencias.response";
import { ObterUploadsRealizadosResponse } from "../core/responses/upload-imagens/obter-uploads-realizados.response";
import { IContratoService } from "./interfaces/contrato.service";

@Injectable()
export class ContratoService implements IContratoService {

  private _contrato: BehaviorSubject<ConsultarContratoResponse> = new BehaviorSubject(null);
  public contrato$ = this._contrato.asObservable().pipe(filter(contrato => !!contrato));

  private _protocoloOrigem: BehaviorSubject<string> = new BehaviorSubject(null);
  public protocoloOrigem$ = this._protocoloOrigem.asObservable().pipe(filter(protocoloOrigem => !!protocoloOrigem));

  private _gravameResponse: BehaviorSubject<GravameResponse> = new BehaviorSubject(null);
  public gravameResponse$ = this._gravameResponse.asObservable().pipe(filter(gravameResponse => !!gravameResponse));

  private _dadosGravame: BehaviorSubject<DetalheGravame> = new BehaviorSubject(null);
  public dadosGravame$ = this._dadosGravame.asObservable().pipe(filter(dadosGravame => !!dadosGravame));

  private _veiculosAdicionados: BehaviorSubject<Veiculo[]> = new BehaviorSubject([]);
  public veiculosAdicionados$ = this._veiculosAdicionados.asObservable().pipe(filter(veiculosAdicionados => !!veiculosAdicionados));

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  registrarContrato(contrato: RegistrarContratoRequest): Observable<RegistrarContratoResponse> {

    let url = this.appSettings.baseUrlApi + 'contratos';

    return this.http.post<RegistrarContratoResponse>(url, contrato)
      .pipe(map(data => this.transformToRegistrarContratoResponse(data)));

  }

  alterarContrato(contrato: AlterarContratoRequest): Observable<AlterarContratoResponse> {
    let url = this.appSettings.baseUrlApi + 'contratos';

    return this.http.put<AlterarContratoResponse>(url, contrato)
      .pipe(map(data => this.transformToAlterarContratoResponse(data)));
  }

  consultarContratoPorProtocolo(protocolo: string) {
    let url = `${this.appSettings.baseUrlApi}contratos/${protocolo}/protocolo`;

    return this.http.get<ConsultarContratoResponse>(url)
      .pipe(map(data => this.transformToConsultarContratoResponse(data)));
  }

  consultarContrato(contrato: ConsultarContratoRequest, empresaId: number) {
    let url = this.appSettings.baseUrlApi + 'contratos/' + contrato.numeroContrato + '/numeroContrato/' + contrato.uf + '/uf';

    const params = new HttpParams()
      .set('tipoOperacao', contrato.tipoOperacao)
      .set('statusTransacao', contrato.statusTransacao)
      .set('empresaId', empresaId)

    return this.http.get<ConsultarContratoResponse>(url, { params: params })
      .pipe(map(data => this.transformToConsultarContratoResponse(data)));
  }

  consultarContratoVeiculo(protocoloOrigem: string): Observable<ConsultarContratoVeiculoResponse> {
    let url = this.appSettings.baseUrlApi + 'contratos/' + protocoloOrigem + "/protocolo";

    const params = new HttpParams()
      .set('fields', 'Veiculo');

    return this.http.get<ConsultarContratoVeiculoResponse>(url, { params: params })
      .pipe(map(data => this.transformToContratoVeiculoResponse(data)))
  }

  enviarImagem(protocolo: string, registrarImagemRequest: RegistrarImagemRequest): Observable<any> {
    let url = this.appSettings.baseUrlApi + 'contratos/' + protocolo + '/imagem';

    return this.http.post<any>(url, registrarImagemRequest)
      .pipe(map(data => this.transformToEnviarImagemResponse(data)));
  }

  obterImagem(protocolo: string) {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/imagem`;

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterImagemResponse(data)));
  }

  obterImagemDownload(protocoloTransacao: string) {
    let url = this.appSettings.baseUrlApi + `contratos/${protocoloTransacao}/imagemBase64`;

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterImagemResponse(data)));
  }

  obterInconsistenciasContratoContrato(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/inconsistencia-contrato`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoVeiculo(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/inconsistencia-veiculo`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoComplementar(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/inconsistencia-complementar`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoFinanciamento(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/inconsistencia-financiamento`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoCredor(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/inconsistencia-credor`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  obterInconsistenciasContratoDevedor(protocolo: string): Observable<ObterInconsistenciasContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/inconsistencia-devedor`;

    return this.http.get<ObterInconsistenciasContratoResponse>(url)
      .pipe(map(data => this.transformToDadosInconsistenciaContrato(data)));
  }

  reenvioContratoEditar(protocolo: string): Observable<ReenvioContratoResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/${protocolo}/contrato-reenvio/editar`;

    return this.http.get<ReenvioContratoResponse>(url)
      .pipe(map(data => this.transformToReenvioContrato(data)));
  }

  consultarGravame(uf: string, chassi: string): Observable<ConsultarGravameResponse> {
    let url = this.appSettings.baseUrlApi + `contratos/consulta-gravame`;

    const params = new HttpParams()
      .set('uf', uf)
      .set('chassi', chassi);

    return this.http.get<ConsultarGravameResponse>(url, { params: params })
      .pipe(map(data => this.transformToConsultarGravame(data)));
  }

  cancelarBaixarContrato(request: CancelarBaixarContratoRequest): Observable<CancelarBaixarContratoResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/baixar-cancelar`;

    return this.http.delete(url, { body: request })
      .pipe(map(data => this.transformToCancelarBaixarContrato(data)));
  }

  obterUploadsRealizados(filtro: any = ''): Observable<ObterUploadsRealizadosResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/transacoes/imagens`;

    let params = new HttpParams();

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key == 'StatusRegistroImagemMsgIds') {
            for (let i = 0; i < filtro[key].length; i++) {
              params = params.append(key, filtro[key][i]);
            }
          }
          else { params = params.append(key, filtro[key]) }
        }
      })
    };
    return this.http.get<ObterUploadsRealizadosResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterUploadsRealizadosResponse(data)));
  }

  realizarUploadImagem(request: RegistrarImagemRequest) {
    let url = `${this.appSettings.baseUrlApi}contratos/imagem`;

    return this.http.post<EnviarImagemResponse>(url, request)
      .pipe(map(data => this.transformToEnviarImagemResponse(data)));
  }

  obterImagemRevisao(empresaId: number, chassi: string): Observable<ObterImagemRevisaoResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/${empresaId}/empresa/${chassi}/chassi`;

    return this.http.get<ObterImagemRevisaoResponse>(url)
      .pipe(map(data => this.transformToObterImagemRevisaoResponse(data)));
  }

  obterImagemStatus(): Observable<ObterImagemStatusResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/transacoes/imagens/status`;

    return this.http.get<ObterImagemStatusResponse>(url)
      .pipe(map(data => this.transformToObterImagemStatusResponse(data)));
  }

  associarImagemContrato(empresaId: number, contratoId: number, protocolo: string): Observable<AssociarImagemContratoResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/${empresaId}/empresa/${contratoId}/contrato/${protocolo}/imagem`;

    return this.http.post<AssociarImagemContratoResponse>(url, { body: null })
      .pipe(map(data => this.transformToAssociarImagemContratoResponse(data)));
  }

  baixarInconsistenciaImagem(protocolo: string): Observable<BaixarInconsistenciaImagemResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/${protocolo}/inconsistencia-imagem`;

    return this.http.get<BaixarInconsistenciaImagemResponse>(url)
      .pipe(map(data => this.transformToBaixarInconsistenciaImagem(data)));
  }

  baixarRelatorioInconsistenciasImg(filtro: any = ''): Observable<BaixarInconsistenciaImagemResponse> {
    let url = `${this.appSettings.baseUrlApi}contratos/inconsistencia-imagem`;

    let params = new HttpParams();

    if (filtro) {
      Object.keys(filtro).forEach((key) => {
        if (filtro[key]) {
          if (key == 'StatusRegistroImagemMsgIds') {
            for (let i = 0; i < filtro[key].length; i++) {
              params = params.append(key, filtro[key][i]);
            }
          }
          else { params = params.append(key, filtro[key]) }
        }
      })
    };
    return this.http.get<BaixarInconsistenciaImagemResponse>(url, { params: params })
      .pipe(map(data => this.transformToBaixarInconsistenciaImagem(data)));
  }

  retornoContrato(contrato: ConsultarContratoResponse): void { this._contrato.next(contrato); }

  retornoProtocolo(protocoloOrigem: string): void { this._protocoloOrigem.next(protocoloOrigem); }

  retornoVeiculosAdicionados(veiculos: Veiculo[]): void { this._veiculosAdicionados.next(veiculos); }

  private transformToRegistrarContratoResponse(data: any): RegistrarContratoResponse {
    let response: RegistrarContratoResponse = new RegistrarContratoResponse();

    if (data.isSuccessful) return response;

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    })

    return response;
  }

  private transformToAlterarContratoResponse(data: any): AlterarContratoResponse {
    let response: AlterarContratoResponse = new AlterarContratoResponse();

    if (data.isSuccessful) { return response; }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    })

    return response;
  }

  private transformToConsultarContratoResponse(data: any) {
    let response: any;

    if (data.isSuccessful) {
      response = data;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); })
    return response;
  }

  private transformToContratoVeiculoResponse(data: any): ConsultarContratoVeiculoResponse {
    let response: ConsultarContratoVeiculoResponse = new ConsultarContratoVeiculoResponse();

    if (data.isSuccessful) {
      response = <ConsultarContratoVeiculoResponse>{
        veiculo: <Veiculo>{
          chassi: data.result.veiculo?.chassi,
          placa: data.result.veiculo?.placa,
          ufPlaca: data.result.veiculo?.ufPlaca,
          anoFabricacao: data.result.veiculo?.anoFabricacao,
          anoModelo: data.result.veiculo?.anoModelo,
          renavam: data.result.veiculo?.renavam,
          numeroRestricao: data.result.veiculo?.numeroRestricao,
          marca: data.result.veiculo?.marca,
          modelo: data.result.veiculo?.modelo,
          emplacado: data.result.veiculo?.emplacado,
          remarcado: data.result.veiculo?.remarcado,
          especie: data.result.veiculo?.especie,
          cor: data.result.veiculo?.cor
        }
      }
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToEnviarImagemResponse(data: any): EnviarImagemResponse {
    let response: EnviarImagemResponse = new EnviarImagemResponse();

    if (data.isSuccessful) {
      response = <EnviarImagemResponse>{
        dataTransacao: data.result.dataTransacao,
        protocoloImagem: data.result.protocoloImagem,
        status: data.result.status,
        isSuccessful: true
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToDadosInconsistenciaContrato(data: any): ObterInconsistenciasContratoResponse {
    let response: ObterInconsistenciasContratoResponse = new ObterInconsistenciasContratoResponse();

    if (data.isSuccessful) {
      response.categoria = data.result.categoria;
      data.result.dadoInconsistenciaContrato.forEach((value: DadosInconsistenciasContrato) => {
        response.dadoInconsistenciaContrato.push(value)
      });
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterImagemResponse(data: any): ObterImagemResponse {
    let response: ObterImagemResponse = new ObterImagemResponse();

    if (data.isSuccessful) {
      response = <ObterImagemResponse>{
        existeImagem: data.result.existeImagem,
        imagem: data.result.imagem
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); })
    return response;
  }

  private transformToReenvioContrato(data: any): ReenvioContratoResponse {
    let response: ReenvioContratoResponse = new ReenvioContratoResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToConsultarGravame(data: any): ConsultarGravameResponse {
    let response: ConsultarGravameResponse = new ConsultarGravameResponse();

    if (data.isSuccessful) {
      response = data.result;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterUploadsRealizadosResponse(data: any): ObterUploadsRealizadosResponse {
    let response: ObterUploadsRealizadosResponse = new ObterUploadsRealizadosResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.transacoesImagens = data.result.transacoesImagens;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterImagemRevisaoResponse(data: any): ObterImagemRevisaoResponse {
    let response: ObterImagemRevisaoResponse = new ObterImagemRevisaoResponse()

    if (data.isSuccessful) {
      response.contratos = data.result.contratos;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterImagemStatusResponse(data: any): ObterImagemStatusResponse {
    let response: ObterImagemStatusResponse = new ObterImagemStatusResponse()

    if (data.isSuccessful) {
      response.statusRegistroImagemMensagens = data.result.statusRegistroImagemMensagens;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToAssociarImagemContratoResponse(data: any): AssociarImagemContratoResponse {
    let response: AssociarImagemContratoResponse = new AssociarImagemContratoResponse()

    if (data.isSuccessful) {
      response.dataTransacao = data.result.dataTransacao;
      response.protocoloImagem = data.result.protocoloImagem;
      response.status = data.result.status;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToBaixarInconsistenciaImagem(data: any): BaixarInconsistenciaImagemResponse {
    let response: BaixarInconsistenciaImagemResponse = new BaixarInconsistenciaImagemResponse();

    if (data.isSuccessful) {
      response.inconsistenciasBase64 = data.result.inconsistenciasBase64;
      response.nomeArquivo = data.result.nomeArquivo;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCancelarBaixarContrato(data: any): CancelarBaixarContratoResponse {
    let response: CancelarBaixarContratoResponse = new CancelarBaixarContratoResponse();

    if (data.isSuccessful) {
      response.protocolo = data.result.protocolo;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }
}