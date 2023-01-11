import { createAction, props } from "@ngrx/store";
import { INotificacaoInconsistenciaValidador } from "../notificacao-inconsistencia-validador.model";

export const notificarInconsistenciaValidador = createAction('[Notificacao] notificar inconsistencia validador', props<{ payload: INotificacaoInconsistenciaValidador }>());