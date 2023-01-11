import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { ObterGruposPermissoesResponse } from "../../core/response/obter-grupos-permissoes.response";
import { IGrupoPermissaoService } from "../interfaces/grupo-permissao.service";

@Injectable()
export class GrupoPermissaoService implements IGrupoPermissaoService {
    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlBackofficeApi}grupo-permissoes`;

    obterGruposPermissoes(): Observable<ObterGruposPermissoesResponse> {
        let url = `${this.api}/acesso`;

        return this.http.get<ObterGruposPermissoesResponse>(url)
            .pipe(map(data => this.transformToObterGruposPermissoesResponse(data)));
    }

    //#region Private

    private transformToObterGruposPermissoesResponse(data: any): ObterGruposPermissoesResponse {
        let response: ObterGruposPermissoesResponse = new ObterGruposPermissoesResponse()

        if (data.isSuccessful) {
            response.grupos = data.result.grupos;
            return response
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });

        return response;
    }

    //#endregion
}