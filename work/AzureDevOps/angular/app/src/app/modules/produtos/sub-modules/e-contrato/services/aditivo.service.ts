import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { AlterarAditivoRequest } from "../core/requests/aditivos/alterar-aditivo.request";
import { RegistrarAditivoRequest } from "../core/requests/contratos/registrar-aditivo.request";
import { AlterarAditivoResponse } from "../core/responses/aditivos/alterar-aditivo.response";
import { RegistrarAditivoResponse } from "../core/responses/contratos/registrar-aditivo.response";
import { IAditivoService } from "./interfaces/aditivo.service";

@Injectable()
export class AditivoService implements IAditivoService {

    private _tipoAditivo: BehaviorSubject<string> = new BehaviorSubject(null);
    public tipoAditivo$ = this._tipoAditivo.asObservable().pipe(filter(aditivo => !!aditivo));

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    alterarAditivo(aditivo: AlterarAditivoRequest): Observable<AlterarAditivoResponse> {
        let url = this.appSettings.baseUrlApi + 'aditivos';

        return this.http.put<AlterarAditivoResponse>(url, aditivo)
            .pipe(map(data => this.transformToAlterarAditivoResponse(data)));
    }

    registrarAditivo(aditivo: RegistrarAditivoRequest): Observable<RegistrarAditivoResponse> {
        let url = this.appSettings.baseUrlApi + 'aditivos';

        return this.http.post<RegistrarAditivoResponse>(url, aditivo)
            .pipe(map(data => this.transfomToRegistarAditivoResponse(data)))
    }

    retornoTipoAditivo(tipoAditivo: string): void { this._tipoAditivo.next(tipoAditivo); }

    private transformToAlterarAditivoResponse(data: any): AlterarAditivoResponse {
        let response: AlterarAditivoResponse = new AlterarAditivoResponse;

        if (data.isSuccessful) { return response; }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
        return response;
    }

    
    private transfomToRegistarAditivoResponse(data: any): RegistrarAditivoResponse {
        let response: RegistrarAditivoResponse = new RegistrarAditivoResponse()

        if (data.isSuccessful) return response

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message, error.propertyName)
        });

        return response
    }
}