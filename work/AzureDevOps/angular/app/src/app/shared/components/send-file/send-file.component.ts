import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { ValorDominio } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/dominios/valor-dominio.model';
import { DominioResponse } from 'src/app/modules/produtos/sub-modules/e-contrato/core/responses/dominios/dominio.response';
import { DialogCustomService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/dialog-custom.service';
import { DominioService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/dominio.service';
import { NotifierService } from '../notifier/notifier.service';

@Component({
  selector: 'app-send-file',
  templateUrl: './send-file.component.html',
  styleUrls: ['./send-file.component.scss']
})
export class SendFileComponent implements OnInit {

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  files: any = null;
  acceptedTypes: string[];
  fileError: string = null;

  versoesLote = [];
  flags = [];

  formulario = this.formBuilder.group({
    lote: '',
  });

  fileDate: string;

  permissoesV020: Permissao;
  permissoesV040: Permissao;
  permissoesFuncao: Permissao;

  constructor(
    private notifierService: NotifierService,
    private dialogService: DialogCustomService,
    private dominioService: DominioService,
    private formBuilder: FormBuilder,) { }

    ngOnInit(): void {
      this.dialogService.setDialogData('nodata');
      this.carregarVersoesLote();
      this.onVersaoChange();
      this.verifyPermission();
    }

    ngOnDestroy(): void {
        this.files = null;
        this.dialogService.setDialogData('nodata');
    }

    onFileDropped($event) {
      if(this.formulario.valid) {
        this.prepareFilesList($event);
      }
    }

    fileBrowseHandler(files) {
      this.prepareFilesList(files);
    }

    /**
     * Converte a lista de arquivos para uma lista normal
     * @param files (Files List)
     */
    prepareFilesList(files: Array<any>) {
      this.files = null;

      if (this.acceptedTypes.find(type => type === files[0].type) === undefined) {
        if(this.formulario.controls['lote'].value == 'v020' || this.formulario.controls['lote'].value == 'v021') {
          this.fileError = 'Formato não permitido. Os formatos aceitos para envio de lote são: CSV e TXT. Por gentileza, verifique e faça o reenvio.'
        } else {
          this.fileError = 'Formato não permitido. O formato aceito para envio de lote é: TXT. Por gentileza, verifique e faça o reenvio.'
        }
        this.notifierService.showNotification('Arquivo com formato inválido.', 'Atenção', 'error');
        this.dialogService.setDialogData('nodata');
        return false;
      }

      this.files = files[0];
      this.fileDate = new Date().toISOString();

      if(files && this.formulario.valid) this.setDialogData(files);

      this.fileDropEl.nativeElement.value = "";
    }

    /**
     * Formata os bytes
     * @param bytes (Tamanho do arquivo em bytes)
     * @param decimals (Pontos decimais)
     */
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) {
        return "0 Bytes";
      }
      const k = 1000;
      const dm = decimals <= 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      let size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

      return size + " " + sizes[i];
    }

    /**
     * Trigger para o click do input file
     * @param fileDropRef (Input file)
     */
    onClickFile(fileDropRef: any) {
      fileDropRef.click();
    }

    /**
     * Seta o DialogData com a base64 do arquivo selecionado
     * @param files (Lista de arquivos do input)
     */
    setDialogData(files) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let idLote = this.versoesLote.filter(v => v.palavraChave == this.formulario.controls['lote'].value)
        let base64 = reader.result.toString();

        this.dialogService.setDialogData({
          versaoLote: idLote[0].id,
          nomeArquivo: file.name,
          operacao: this.formulario.controls['operacao'] ? this.formulario.controls['operacao'].value : null,
          file: base64.split('base64,')[1]
        });
      };
    }

    carregarVersoesLote() {
      this.dominioService.obterPorTipo('VERSOES_LOTE')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            this.versoesLote.push(dominio);
          })
        }
      })
    }

    showOperacao: boolean = false;

    onVersaoChange() {
      this.formulario.controls['lote'].valueChanges.subscribe(value => {
        this.files = null;
        this.fileError = null;
        this.dialogService.setDialogData('nodata');
        if(value === 'v020' || value === 'v021') {
          this.acceptedTypes = ["text/csv", "text/plain"];
        } else {
          this.acceptedTypes = ["text/plain"];
        }

        if(value === 'v021') {
          this.showOperacao = true;
          this.formulario.addControl('operacao', new FormControl('', Validators.required));

          this.formulario.controls['operacao'].valueChanges.subscribe(value => {
           if(!value) {
            this.files = null;
            this.fileError = null;
            this.dialogService.setDialogData('nodata');
           }

          })
        } else {
          this.formulario.removeControl('operacao');
          this.showOperacao = false;
        }

      })
    }

    public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
      return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
    }

    formatDate(date: string) {
      return Utility.formatDateTime(date);
    }

    verifyPermission() {
      let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

      if (ehmaster) {
        this.permissoesV020 = this.getPermissaoMasterDefault();
        this.permissoesV040 = this.getPermissaoMasterDefault();
        this.permissoesFuncao = this.getPermissaoMasterDefault();
        return;
      }
  
      let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];

      this.permissoesV020 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'LOTE_ENVIO_LOTE_020'))[0];
      this.permissoesV040 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'LOTE_ENVIO_LOTE_040'))[0];
      this.permissoesFuncao = listaPermissoes.filter(permissao => (permissao.palavraChave == 'LOTE_ENVIO_LOTE_FUNCAO'))[0];
    }

    checkAllowVersao(key) {
      if (key == 'v020') {
        return !this.permissoesV020.editar
      }
      if (key == 'v040') {
        return !this.permissoesV040.editar
      }
      if (key == 'v050-FUNCAO') {
        return !this.permissoesFuncao.editar
      }
    }

    private getPermissaoMasterDefault(): Permissao {
      return <Permissao>{
        id: 0,
        palavraChave: "",
        nome: '',
        admin: true,
        consultar: true,
        editar: true
      };
    }
}
