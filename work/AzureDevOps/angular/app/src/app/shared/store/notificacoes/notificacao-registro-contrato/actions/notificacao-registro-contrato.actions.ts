import { createAction, props } from "@ngrx/store";
import { INotificacaoRegistroContrato } from "../notificacao-registro-contrato.model";

export const notificarRegistroContrato = createAction('[Notificacao] notificar registro contrato', props<{ payload: INotificacaoRegistroContrato }>());