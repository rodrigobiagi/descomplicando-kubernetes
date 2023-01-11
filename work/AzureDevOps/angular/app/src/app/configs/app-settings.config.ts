import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable()
export class AppSettings {

    get baseUrlApi(): string {
        return environment.api.url;
    }

    get baseUrlBackofficeApi(): string {
        return environment.api_backoffice.url;
    }

    get endpointHub(): string {
        return `${environment.hubs.url}${environment.hubs.econtrato.eContrato}`;
    }
}