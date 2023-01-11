import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { Transacoes } from '../core/models/transacoes/transacoes.model';
import { TransacoesResponse } from '../core/responses/transacoes/transacoes.response';
import { ObterTransacoesPaginationResponse } from '../core/responses/transacoes/obter-transacoes-pagination-response';
import { TransacoesDetalhesResponse } from '../core/responses/transacoes/transacoes-detalhes.response';
import { TransacoesStatusResponse } from '../core/responses/transacoes/transacoes-status.response';
import { ObterStatusTransacoesResponse } from '../core/responses/transacoes/obter-status-transacoes.response';

import { map } from 'rxjs/operators';
import { EnviarLoteResponse } from '../core/responses/contratos/enviar-lote.response';
import { Observable } from 'rxjs/internal/Observable';
import { ObterLotesRequest } from '../core/requests/transacoes/obter-lotes.request';
import { ObterLotesResponse } from '../core/responses/transacoes/obter-lotes.response';
import { ObterLoteResponse } from '../core/responses/transacoes/obter-lote.response';
import { ObterLoteBase64Response } from '../core/responses/transacoes/obter-lote-base64.response';

@Injectable()
export class TransacaoService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  obterTodasTransacoes(pageIndex: number = 0, pageSize: number = 25) {
    let url = `${this.appSettings.baseUrlApi}transacoes`;

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    return this.http.get<TransacoesResponse>(url, { params: params })
      .pipe(map(data => this.consultarTransacoesResponse(data)));
  }

  obterDetalhesTransacao(protocolo: string) {
    let url = `${this.appSettings.baseUrlApi}transacoes/${protocolo}`;

    return this.http.get<TransacoesDetalhesResponse>(url)
      .pipe(map(data => this.consultarTransacaoDetalhesResponse(data)));
  }

  obterStatusTransacoes() {
    let url = `${this.appSettings.baseUrlApi}transacoes/status`;

    return this.http.get<TransacoesStatusResponse>(url)
      .pipe(map(data => this.consultarTransacaoStatusResponse(data)));
  }

  filtrarTransacoes(filtro) {
    let url = `${this.appSettings.baseUrlApi}transacoes`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key]) {
        if (key == 'DocumentoCredor') {
          for (let i = 0; i < filtro[key].length; i++) {
            params = params.append(key, filtro[key][i]);
          }
        }
        else { params = params.append(key, filtro[key]) }
      }
    });

    return this.http.get<TransacoesResponse>(url, { params: params })
      .pipe(map(data => this.consultarTransacoesResponse(data)));
  }

  enviarLote(base64: string, dominio: number, operacao: number, nomeArquivo: string): Observable<any> {
    let url = this.appSettings.baseUrlApi + 'transacoes/lotes';

    return this.http.post<any>(url, { loteBase64: base64, dominioId: dominio, operacaoId: operacao, nomeArquivo: nomeArquivo })
      .pipe(map(data => this.transformToEnviarLoteResponse(data)));
  }

  obterLotes(obterLotesRequest: ObterLotesRequest, pageIndex: number = 0, pageSize: number = 25) {
    let url = this.appSettings.baseUrlApi + 'transacoes/resumo-lotes';

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    return this.http.post<ObterLotesResponse>(url, obterLotesRequest, { params: params })
      .pipe(map(data => this.transformToObterLotesReponse(data)));
  }

  private consultarTransacoesResponse(data: any) {
    let response: ObterTransacoesPaginationResponse = new ObterTransacoesPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;

      data.result.transacoes.forEach((transacao: Transacoes) => {
        response.transacoes.push(transacao);
      })

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private consultarTransacaoDetalhesResponse(data: any) {
    let response: any

    if (data.isSuccessful) {
      response = data
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private consultarTransacaoStatusResponse(data: any) {
    let response: ObterStatusTransacoesResponse = new ObterStatusTransacoesResponse()

    if (data.isSuccessful) {
      data.result.statusTransacao.forEach((status: any) => {
        response.statusTransacao.push(status);
      })

      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  obterLote(protocolo: string) {
    let url = this.appSettings.baseUrlApi + 'transacoes/' + protocolo + '/lote';

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterLoteResponse(data)));
  }

  obterLoteBase64(protocolo: string, tipoArquivo: string) {
    let url = this.appSettings.baseUrlApi + 'transacoes/lote/' + protocolo + '/retorno-processamento/' + tipoArquivo;

    return this.http.get<any>(url)
      .pipe(map(data => this.transformToObterLoteBase64Response(data)));
  }

  private transformToEnviarLoteResponse(data: any): EnviarLoteResponse {
    let response: EnviarLoteResponse = new EnviarLoteResponse();

    if (data.isSuccessful) {
      response = <EnviarLoteResponse>{
        isSuccessful: true,
        status: data.result.status,
        dataTransacao: data.result.dataTransacao,
        protocoloLote: data.result.protocoloLote
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterLotesReponse(data: any): ObterLotesResponse {
    let response: ObterLotesResponse = new ObterLotesResponse();

    if (data.isSuccessful) {
      response = <ObterLotesResponse>{
        pageIndex: data.result.pageIndex,
        totalItems: data.result.totalItems,
        lotes: data.result.lotes
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterLoteResponse(data: any): ObterLoteResponse {
    let response: ObterLoteResponse = new ObterLoteResponse();

    if (data.isSuccessful) {
      response = <ObterLoteResponse>{
        usuarioId: data.result.usuarioId,
        protocolo: data.result.protocolo,
        dominioId: data.result.dominioId,
        operacaoId: data.result.operacaoId,
        nomeArquivo: data.result.nomeArquivo,
        url: data.result.url,
        totalLinhas: data.result.totalLinhas,
        statusLoteId: data.result.statusLoteId,
        empresaId: data.result.empresaId,
        criadoEm: data.result.criadoEm,
        modificadoEm: data.result.modificadoEm
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }

  private transformToObterLoteBase64Response(data: any): ObterLoteBase64Response {
    let response: ObterLoteBase64Response = new ObterLoteBase64Response();

    if (data.isSuccessful) {
      response = <ObterLoteBase64Response>{
        loteBase64: data.result.loteBase64,
        nomeArquivo: data.result.nomeArquivo,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message);
    })

    return response;
  }
}
