import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { ObterAtividadesRecentesResponse } from "../core/responses/obter-atividades-recentes.response";
import { ObterGraficoRegistroEstadoResponse } from "../core/responses/obter-grafico-registro-estado.response";
import { ObterGraficoTipoOperacaoResponse } from "../core/responses/obter-grafico-tipo-operacao.response";
import { ObterResumoResponse } from "../core/responses/obter-resumo.response";
import { IDashboardService } from "./interfaces/dashboard.service.interface";

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlApi}dashboard`;

  obterGraficoTipoOperacao() {
    let url = `${this.api}/tipos-operacao`;

    return this.http.get<ObterGraficoTipoOperacaoResponse>(url)
      .pipe(map(data => this.transformToObterGraficoTipoOperacao(data)));
  }

  obterAtividadesRecentes(empresaId: number): Observable<ObterAtividadesRecentesResponse> {
    let url = `${this.api}/${empresaId}/atividades`;

    return this.http.get<ObterAtividadesRecentesResponse>(url)
      .pipe(map(data => this.transformToObterAtividadesRecentes(data)));
  }

  obterGraficoRegistroPorEstado() {
    let url = `${this.api}/registros-estado`;

    return this.http.get<ObterGraficoRegistroEstadoResponse>(url)
      .pipe(map(data => this.transformToObterGraficoRegistroPorEstado(data)));
  }

  obterResumo(): Observable<ObterResumoResponse> {
    let url = `${this.api}/home-dashboard`;

    return this.http.get<ObterResumoResponse>(url)
      .pipe(map(data => this.transformToObterRegistrosResumo(data)));
  }

  //#region Privates
  private transformToObterGraficoTipoOperacao(data: any): ObterGraficoTipoOperacaoResponse {
    let response: ObterGraficoTipoOperacaoResponse = new ObterGraficoTipoOperacaoResponse();

    if (data.isSuccessful) {
      response.registros = data.result.registros;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterAtividadesRecentes(data: any): ObterAtividadesRecentesResponse {
    let response: ObterAtividadesRecentesResponse = new ObterAtividadesRecentesResponse();

    if (data.isSuccessful) {
      response.atividades = data.result.atividades;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterGraficoRegistroPorEstado(data: any): ObterGraficoRegistroEstadoResponse {
    let response: ObterGraficoRegistroEstadoResponse = new ObterGraficoRegistroEstadoResponse();

    if (data.isSuccessful) {
      response.registros = data.result.registros
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterRegistrosResumo(data: any): ObterResumoResponse {
    let response: ObterResumoResponse = new ObterResumoResponse();

    if (data.isSuccessful) {
      response.registros = data.result.registros;
      response.registrosInconsistentes = data.result.registrosInconsistentes;
      response.registrosImagensPendentes = data.result.registrosImagensPendentes;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
  //#endregion
}
