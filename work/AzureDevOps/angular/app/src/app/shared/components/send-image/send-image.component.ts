import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { SendImageModel } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/common/send-image.model';
import { ObterImagemResponse } from 'src/app/modules/produtos/sub-modules/e-contrato/core/responses/contratos/obter-imagem.response';
import { ContratoService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/contrato.service';
import { ImagemService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/image.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from '../../../modules/produtos/sub-modules/e-contrato/services/dialog-custom.service';

@Component({
  selector: 'app-send-image',
  templateUrl: './send-image.component.html',
  styleUrls: ['./send-image.component.scss']
})
export class SendImageComponent implements OnInit, OnDestroy {

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;

  files: any = null;
  acceptedTypes: string[] = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/tiff"];
  fileError: string = null;
  obterImagem: ObterImagemResponse = <ObterImagemResponse>{ existeImagem: false, imagem: null };
  pipe = new DatePipe('en-US');
  imagemBase64: string = "";
  loading: boolean = false;
  fileName: string = "";

  permissoesConsulta: Permissao;

  constructor(
    private notifierService: NotifierService,
    private dialogService: DialogCustomService,
    private imagemService: ImagemService,
    private contratoService: ContratoService,
    private router: Router) { }

  ngOnInit(): void {
    this.verifyPermission();

    this.dialogService.setDialogData('nodata');
    this.files = null;
    this.obterImagem = <ObterImagemResponse>{ existeImagem: false, imagem: null };
    this.imagemService.imageData$.subscribe(img => { this.obterImagem = img; });
  }
  
  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesConsulta = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];

    this.permissoesConsulta = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS'))[0];
    if (!this.permissoesConsulta.consultar) {
      this.router.navigate(['../']);
    }
  }

  ngOnDestroy(): void {
    this.files = null;
    this.obterImagem = <ObterImagemResponse>{ existeImagem: false, imagem: null };
    this.imagemBase64 = "";
    this.dialogService.setDialogData('nodata');
  }

  onFileDropped($event) {
    if (!this.permissoesConsulta.editar) return;
    this.prepareFilesList($event);
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
      this.fileError = 'Formato não permitido. Os formatos aceitos para envio de imagem são: PDF, JPEG, JPG, PNG e TIFF. Por gentileza, verifique e faça o reenvio.'
      this.notifierService.showNotification('Arquivo com formato inválido.', 'Atenção', 'error');
      this.dialogService.setDialogData('nodata');
      return false;
    }

    if (!this.formatBytes(files[0].size)) {
      this.fileError = 'Tamanho não permitido. O tamanho máximo permitido da Imagem do contrato é de 10 MB. Por gentileza, carregar um novo arquivo.'
      this.notifierService.showNotification('Arquivo com tamanho excedido.', 'Atenção', 'error');
      this.dialogService.setDialogData('nodata');
      return false;
    }

    this.fileError = null;
    this.files = files[0];
    this.setDialogData(files);
    this.obterImagem = <ObterImagemResponse>{ existeImagem: false, imagem: null };

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

    if (sizes[i] === "MB") {
      if (size > 10) {
        this.files = null;
        return false;
      }
    }

    return size + " " + sizes[i];
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    if (!this.permissoesConsulta.editar) return;

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
      let base64 = reader.result.toString();
      let nomeArquivo = file.name.replace("." + file.name.split('.').pop(), "");
      let valor = nomeArquivo;
      if (valor.length > 30) {
        let invalidChar = 30 - valor.length;
        valor = valor.slice(0, invalidChar)
      }

      this.fileName = valor + "." + file.name.split('.').pop();

      let sendImage: SendImageModel = <SendImageModel>{
        imagemBase64: base64.split('base64,')[1],
        nomeArquivo: this.fileName
      };

      this.dialogService.setDialogData(sendImage);
    };
  }

  onClickDownload() {
    this.loading = true;
    if (this.imagemBase64 == "") {
      this.contratoService.obterImagemDownload(this.obterImagem?.imagem.protocoloTransacao).toPromise()
        .then(response => {
          let mimeType = this.detectMimeType(response.imagem.imagemBase64);
          this.imagemBase64 = `data:${mimeType};base64,${response.imagem.imagemBase64}`;
          this.downloadImagem();
        })
    }
    else { this.downloadImagem(); }
  }

  downloadImagem() {
    var element = document.createElement('a');
    element.setAttribute('download', this.obterImagem?.imagem.nome);
    element.setAttribute('href', this.imagemBase64)
    document.body.appendChild(element);
    element.click();

    this.loading = false;
  }

  detectMimeType(base64: string) {
    var signatures = {
      IVBOR: "image/png",
      "/9j/4": "image/jpg",
      JVBER: "application/pdf",
      SUKQA: "image/tiff",
      DMFSA: "text/plain",
      EYJHZ: "text/csv"
    };

    for (var s in signatures) {
      if (base64.indexOf(s) === 0) {
        return signatures[s];
      }
    }
  }

  getFileName() {
    if (this.files === null) { return this.obterImagem.imagem.nome; }
    return this.fileName;
  }

  getFileDetails() {
    if (this.files === null) { return this.pipe.transform(this.obterImagem.imagem.criadoEm, 'dd/MM/yyyy - HH:mm:ss') }
    return this.formatBytes(this.files?.size);
  }

  showImage() {
    return this.files !== null || this.obterImagem.existeImagem;
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
