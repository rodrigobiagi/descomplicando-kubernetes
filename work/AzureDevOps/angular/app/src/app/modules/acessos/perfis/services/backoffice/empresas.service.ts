import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppSettings } from 'src/app/configs/app-settings.config';
import { ErrorMessage } from 'src/app/core/responses/error-message';

import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { CriarPerfilResponse } from '../../core/response/criar-perfil.response';
import { CriarPerfilRequest } from '../../core/request/criar-perfil.request';
import { ObterPerfisResponse } from 'src/app/modules/produtos/sub-modules/e-contrato/core/responses/_backoffice/empresas/obter-perfis.response';
import { IEmpresasService } from '../interfaces/empresas.service';

@Injectable()
export class EmpresasService implements IEmpresasService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlBackofficeApi}empresas`;

  //#region Perfis
  obterPerfis(empresaId: number, filtro: any): Observable<ObterPerfisResponse> {
    let url = `${this.api}/${empresaId}/perfis`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => { if (filtro[key] !== '' || filtro[key].length !== 0) params = params.append(key, filtro[key]) });

    return this.http
      .get<ObterPerfisResponse>(url, { params: filtro })
      .pipe(map((data) => this.transformToObterPerfisResponse(data)));
  }

  criarPerfil(empresaId: number, criarPerfilRequest: CriarPerfilRequest): Observable<CriarPerfilResponse> {
    let url = `${this.api}/${empresaId}/perfis`;

    return this.http.post<CriarPerfilResponse>(url, criarPerfilRequest)
      .pipe(map(data => this.transformToCriarPerfilResponse(data)));
  }

  atualizarPerfil(empresaId: number, perfilId: number, criarPerfilRequest: CriarPerfilRequest): Observable<CriarPerfilResponse> {
    let url = `${this.api}/${empresaId}/perfis/${perfilId}`;

    return this.http.put<CriarPerfilResponse>(url, criarPerfilRequest)
      .pipe(map(data => this.transformToCriarPerfilResponse(data)));
  }

  //#region Private
  private transformToObterPerfisResponse(data: any): ObterPerfisResponse {
    let response: ObterPerfisResponse = new ObterPerfisResponse();

    if (data.isSuccessful) {
      response = <ObterPerfisResponse>{
        pageIndex: data.result.pageIndex,
        totalItems: data.result.totalItems,
        perfis: data.result.perfis,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); });
    return response;
  }

  private transformToCriarPerfilResponse(data: any): CriarPerfilResponse {
    let response: CriarPerfilResponse = new CriarPerfilResponse()

    if (data.isSuccessful) {
        response.perfilId = data.result.perfilId;
        return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
}

  //#endregion Private
  //#endregion
}
