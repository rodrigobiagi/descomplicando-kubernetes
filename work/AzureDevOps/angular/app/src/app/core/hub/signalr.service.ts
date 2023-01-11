import { Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import { Store } from "@ngrx/store";
import { AppSettings } from "src/app/configs/app-settings.config";
import { notificarConsultaGravame } from "src/app/shared/store/notificacoes/notificacao-consulta-gravame/actions/notificacao-consulta-gravame.actions";
import { notificarInconsistenciaValidador } from "src/app/shared/store/notificacoes/notificacao-inconsistencia-validador/actions/notificacao-inconsistencia-validador.actions";
import { notificarRegistroContrato } from "src/app/shared/store/notificacoes/notificacao-registro-contrato/actions/notificacao-registro-contrato.actions";
import { INotificacaoRegistroContratoState } from "src/app/shared/store/notificacoes/notificacao-registro-contrato/notificacao-registro-contrato.reducer";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  public hubConnection!: HubConnection;

  constructor(private appSettings: AppSettings,
    private authService: AuthService,
    private store: Store<{ notificacaoRegistroContrato: INotificacaoRegistroContratoState }>) {
  }

  public init() {
    this.createConnection();
    this.register();
    this.startConnection();
  }

  private createConnection(): void {

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.appSettings.endpointHub)
      .withHubProtocol(new MessagePackHubProtocol())
      .configureLogging(LogLevel.Debug)
      .build();
  }

  private register(): void {

    this.hubConnection.on('ContratoProcessadoNotification', (usuarioGuid: string, codigo: number, mensagem: string) => {

      this.store.dispatch(notificarRegistroContrato(
        {
          payload:
          {
            usuarioGuid: usuarioGuid,
            codigo: codigo,
            mensagem: mensagem
          }
        }));
    })

    this.hubConnection.on('InconsistenciaValidadorNotification', (usuarioGuid: string, message: string) => {

      this.store.dispatch(notificarInconsistenciaValidador(
        {
          payload:
          {
            usuarioGuid: usuarioGuid,
            message: message
          }
        }
      ))
    })

    this.hubConnection.on('ConsultaGravameNotification', (usuarioGuid: string, codigo: number, descricao: string, anoModelo: number, anoFabricacao: number, remarcado: number, dataVigenciaContrato: string, cnpjAgente: string) => {

      this.store.dispatch(notificarConsultaGravame({
        payload: {
          usuarioGuid: usuarioGuid,
          codigo: codigo,
          descricao: descricao,
          anoModelo: anoModelo,
          anoFabricacao: anoFabricacao,
          remarcado: remarcado,
          dataVigenciaContrato: dataVigenciaContrato,
          cnpjAgente: cnpjAgente
        }
      }))
    });

    this.hubConnection.off('ConsultaGravameNotification', () => {
      this.store.next(notificarConsultaGravame({
        payload: {
          usuarioGuid: '',
          codigo: null,
          descricao: '',
          anoModelo: null,
          anoFabricacao: null,
          remarcado: null,
          dataVigenciaContrato: '',
          cnpjAgente: ''
        }
      }));

      this.store.complete();
    })
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => this.addUserToGroup())
      .catch(err => console.error(err));
  }

  private async addUserToGroup(): Promise<void> {

    let user = await this.authService.obterUsuarioAtual();

    this.hubConnection
      .send('AddUserToGroup', user.id)
      .catch(err => console.error(err));
  }
}