import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { GravameResponse } from 'src/app/modules/produtos/sub-modules/e-contrato/core/responses/contratos/gravame.response';
import { ContratoService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/contrato.service';
import { INotificacaoConsultaGravameState } from '../../store/notificacoes/notificacao-consulta-gravame/notificacao-consulta-gravame.reducer';
import { INotificacaoInconsistenciaValidadorState } from '../../store/notificacoes/notificacao-inconsistencia-validador/notificacao-inconsistencia-validador.reducer';
import { INotificacaoRegistroContratoState } from '../../store/notificacoes/notificacao-registro-contrato/notificacao-registro-contrato.reducer';
import { NotifierService } from '../notifier/notifier.service';

@Component({
  selector: 'app-notificacao',
  templateUrl: './notificacao.component.html',
  styleUrls: ['./notificacao.component.scss']
})
export class NotificacaoComponent implements OnInit {

  contadorNotificacao: number = null;

  constructor(private storeRegistroContrato: Store<{ notificacaoRegistroContrato: INotificacaoRegistroContratoState }>,
    private storeInconsistenciaValidador: Store<{ notificacaoInconsistenciaValidador: INotificacaoInconsistenciaValidadorState }>,
    private notifierService: NotifierService) { }

  notificacaoRegistroContrato$ = this.storeRegistroContrato.select('notificacaoRegistroContrato')
    .pipe(map(notification => {
      if (notification.usuarioGuid !== '') {
        this.notifierService.showNotification(`Código: ${notification.codigo} - ${notification.mensagem}`, 'Registro Contrato', 'success');
      }
    }));

  notificacaoInconsistenciaValidador$ = this.storeInconsistenciaValidador.select('notificacaoInconsistenciaValidador')
    .pipe(map(notification => {
      if (notification.usuarioGuid !== '') {
        this.notifierService.showNotification(notification.message, 'Inconsistencia Encontrada', 'error')
      }
    }))

  ngOnInit(): void { }
}
