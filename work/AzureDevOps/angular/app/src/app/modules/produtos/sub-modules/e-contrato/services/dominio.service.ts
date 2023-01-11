import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { ValorDominio } from "../core/models/dominios/valor-dominio.model";
import { DominioResponse } from "../core/responses/dominios/dominio.response";
import { IDominioService } from "./interfaces/dominio.service";

@Injectable()
export class DominioService implements IDominioService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    obterPorTipo(tipoDominio: string): Observable<DominioResponse> {
        let url = this.appSettings.baseUrlApi + 'dominios/' + tipoDominio;

        return this.http.get<DominioResponse>(url)
            .pipe(map(data => this.transformToDominioResponse(data)));
    }

    private transformToDominioResponse(data: any): DominioResponse {
        let response: DominioResponse = new DominioResponse();

        if (data.isSuccessful) {
            response.tipoDominio = data.result.tipoDominio;

            data.result.valorDominio.forEach((dominio: ValorDominio) => {
                let valorDominio = new ValorDominio();

                valorDominio.id = dominio.id;
                valorDominio.valor = dominio.valor;
                valorDominio.palavraChave = dominio.palavraChave;

                response.valorDominio.push(valorDominio);
            })

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }
}