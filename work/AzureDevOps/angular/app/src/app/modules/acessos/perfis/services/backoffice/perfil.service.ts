import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";

import { CriarPerfilRequest } from "../../core/request/criar-perfil.request";
import { AtivarInativarResponse } from "../../core/response/ativar-inativar.response";
import { CriarPerfilResponse } from "../../core/response/criar-perfil.response";
import { ObterPerfilResponse } from "../../core/response/obter-perfil.response";
import { ObterPerfisPaginationResponse } from "../../core/response/obter-perfis-pagination.response";
import { IPerfilService } from "../interfaces/perfil.service";

@Injectable()
export class PerfilService implements IPerfilService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlBackofficeApi}perfis`;

    obterPerfisPaginado(pageIndex: number = 0, pageSize: number = 25, filtro: any = '', sort: string = ''): Observable<ObterPerfisPaginationResponse> {
        let params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize)
            .set('sort', sort)

        if (filtro) {
            Object.keys(filtro).forEach((key) => {
                if (filtro[key]) { params = params.append(key, filtro[key]) }
            })
        };
        return this.http.get<ObterPerfisPaginationResponse>(this.api, { params: params })
            .pipe(map(data => this.transformToObterPerfisPaginadoResponse(data)));
    }

    obterPerfil(perfilId: number): Observable<ObterPerfilResponse> {
        let url = `${this.api}/${perfilId}`;

        return this.http.get<ObterPerfilResponse>(url)
            .pipe(map(data => this.transformToObterPerfilResponse(data)));
    }

    ativarPerfil(perfilId: number) {
        let url = `${this.api}/${perfilId}/ativar`;

        return this.http.put<AtivarInativarResponse>(url, null)
            .pipe(map(data => this.transformToAtivarInativarPerfil(data)));
    }

    inativarPerfil(perfilId: number): Observable<AtivarInativarResponse> {
        let url = `${this.api}/${perfilId}/inativar`;

        return this.http.delete<AtivarInativarResponse>(url)
            .pipe(map(data => this.transformToAtivarInativarPerfil(data)));
    }

    //#region Private

    private transformToObterPerfisPaginadoResponse(data: any): ObterPerfisPaginationResponse {
        let response: ObterPerfisPaginationResponse = new ObterPerfisPaginationResponse()

        if (data.isSuccessful) {
            response.totalItems = data.result.totalItems;
            response.perfis = data.result.perfis;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToObterPerfilResponse(data: any): ObterPerfilResponse {
        let response: ObterPerfilResponse = new ObterPerfilResponse()

        if (data.isSuccessful) {
            response.id = data.result.id;
            response.empresaId = data.result.empresaId;
            response.nome = data.result.nome;
            response.descricao = data.result.descricao;
            response.convidado = data.result.convidado;
            response.ativo = data.result.ativo;
            response.grupos = data.result.grupos;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    private transformToAtivarInativarPerfil(data: any): AtivarInativarResponse {
        let response: AtivarInativarResponse = new AtivarInativarResponse()

        if (data.isSuccessful) {
            response = data.result;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
        return response;
    }

    //#endregion
}
