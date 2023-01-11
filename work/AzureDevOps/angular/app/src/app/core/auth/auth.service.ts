import { KeycloakEventType, KeycloakService } from "keycloak-angular";
import { Usuario } from "../models/usuarios/usuario.model";
import { IAuthUserInfo } from "./interfaces/auth-user-info";
import { IAuthService } from "./interfaces/auth.service";

export class AuthService implements IAuthService {

    constructor(private keycloakService: KeycloakService) {

        keycloakService.keycloakEvents$.subscribe({
            next: event => {
                if(event.type == KeycloakEventType.OnTokenExpired) {
                    //TODO:
                }
            }
        })
    }

    public obterUsuarioAtual(): Promise<Usuario> {

        const promise = new Promise<Usuario>((resolve, reject) => {
            this.keycloakService.getKeycloakInstance()
                .loadUserInfo()
                .then((userInfo: IAuthUserInfo) => {
                    resolve(new Usuario(userInfo.sub, userInfo.given_name, userInfo.family_name, userInfo.email, userInfo.empresaId))
                    sessionStorage.setItem('userGuid', `${userInfo.sub}`)
                    sessionStorage.setItem('empresaId', `${userInfo.empresaId}`)
                })
        })

        return promise;
    }

    public logout(clearToken?: boolean): void {

        if(clearToken) {
            this.keycloakService.clearToken();
        }

        this.keycloakService.logout(window.location.origin);
    }
}
