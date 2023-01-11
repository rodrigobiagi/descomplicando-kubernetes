import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { TipoStatusImagem } from '../../core/enums/tipo-status-imagem.enum';
import { EmpresasAF } from '../../core/models/empresas/empresasAF.model';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';
import { UploadImagem } from '../../core/models/upload-imagens/upload-imagem.model';
import { RegistrarImagemRequest } from '../../core/requests/contratos/registrar-imagem.request';
import { ContratoService } from '../../services/contrato.service';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';

@Component({
  selector: 'app-upload-imagens',
  templateUrl: './upload-imagens.component.html',
  styleUrls: ['./upload-imagens.component.scss']
})
export class UploadImagensComponent implements OnInit {

  formulario = this.formBuilder.group({
    empresa: '',
  });

  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<any[]>;
  empresas: EmpresasAF[];
  usuarioGuid: string;

  files: UploadImagem[] = [];
  acceptedTypes: string[] = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/tiff"];
  fileError: string = null;
  pipe = new DatePipe('en-US');
  imagemBase64: string = "";
  loading: boolean = false;
  fileName: string = "";

  addFile: any = null;
  addFileExtension: string[] = [];
  timer: NodeJS.Timeout;
  loaderImage: number = 0;

  permissoesUploadImagem: Permissao;
  permissoesConvidadoUploadImagem: PermissoesConvidados[];

  constructor(
    private formBuilder: FormBuilder,
    private agenteFinanceiroService: AgenteFinanceiroService,
    private contratoService: ContratoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.verifyPermission();
    this.usuarioGuid = sessionStorage.getItem('userGuid');
    this.carregarEmpresas();
  }

  private verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;
    let listaPermissoesConvidado = JSON.parse(localStorage.getItem('permissionsConvidado')) as PermissoesConvidados[];
    this.permissoesConvidadoUploadImagem = this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS');

    if (ehmaster) {
      this.permissoesUploadImagem = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.permissoesUploadImagem = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS'))[0];

    if (!this.permissoesUploadImagem?.editar && this.permissoesConvidadoUploadImagem.filter(p => p.editar).length == 0) {
      this.router.navigate(['../']);
      return;
    }
  }

  private getPermissaoConvidado(listaPermissoes: PermissoesConvidados[], palavraChave: string): PermissoesConvidados[] {
    return listaPermissoes.filter(permissao => permissao.palavraChave == palavraChave);
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

  private carregarEmpresas() {
    this.empresas = [];
    this.agenteFinanceiroService.obterAgentesFinanceirosPorUsuarioGuid(this.usuarioGuid).subscribe(res => {
      res.empresas.forEach(empresa => {
        if ((this.permissoesUploadImagem.editar && +sessionStorage.getItem('empresaId') == empresa.id)
          || this.permissoesConvidadoUploadImagem.findIndex(p => p.editar && p.empresaId == empresa.id) > -1) {
          this.empresas.push(empresa);
        }
        this.filteredOptions = this.formulario.get('empresa').valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || '')),
        );
      })
    })
  }

  displayFn = empresa => {
    let cnpj = this.formatCnpj(empresa.cnpj);
    return empresa && empresa.nome + ' | ' + cnpj ? empresa.nome + ' | ' + cnpj : '';
  }

  private _filter(value) {
    if (typeof (value) == 'object') return;

    let filterValue  = this.checkNumbersOnly(value);
    if (this.empresas) {
      let filtered = this.empresas.filter(empresa => {

        if (empresa.nome.toLowerCase().includes(filterValue) || empresa.cnpj.includes(filterValue)) {
          return empresa;
        }
      });
      return filtered;
    }
    return;
  }

  checkNumbersOnly(filtro: string) {
    let retorno = filtro;
    let numbers = +(retorno.replace(/[^a-zA-Z\d]*/g, ''));

    if (!isNaN(numbers)) { return numbers.toString(); }
    return filtro.toLocaleLowerCase();
  }

  getExtension(file) {
    return file.nome.split('.').pop().toUpperCase();
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

    return size + ' ' + sizes[i];
  }

  prepareFilesList(files: Array<any>) {
    this.addFile = [];

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(files[i]);
      reader.onload = () => {
        let base64 = reader.result.toString();
        let file: UploadImagem = {
          nome: files[i].name,
          type: files[i].type,
          tamanho: files[i].size,
          dataEnvio: this.pipe.transform(new Date(), 'dd-MM-yyyy - HH:mm:ss'),
          base64: base64.split('base64,')[1],
          statusArquivo: TipoStatusImagem.Processando
        };
        this.files.push(file);
        this.addFile.push(file);
        this.loadBar(file);
      };
    }

    Utility.waitFor(() => {
      this.processarImagens();
    }, 1000);
  }

  processarImagens() {
    for (let i = 0; i < this.addFile.length; i++) {
      let index = this.files.indexOf(this.addFile[i]);
      if ((this.acceptedTypes.find(type => type === this.addFile[i].type) === undefined) || this.addFile[i].nome.split('.').pop().toUpperCase() === 'DOT') { this.files[index].statusArquivo = TipoStatusImagem.FormatoInvalido; }
      else if (this.addFile[i].tamanho > 10000000) { this.files[index].statusArquivo = TipoStatusImagem.TamanhoInvalido; }
      else if (this.addFile[i].nome.replace("." + this.addFile[i].nome.split('.').pop(), "").length > 21) { this.files[index].statusArquivo = TipoStatusImagem.NomeInvalido; }
      else {
        this.realizaUploadImagem(this.files[index]);
      }
    }
  }

  realizaUploadImagem(file: UploadImagem) {
    this.contratoService.realizarUploadImagem(<RegistrarImagemRequest>{ imagemBase64: file.base64, nomeArquivo: file.nome }).toPromise()
      .then(response => {
        file.progresso = 100;
        Utility.waitFor(() => { file.statusArquivo = TipoStatusImagem.Sucesso }, 500);
      })
      .catch(() => {
        file.progresso = 100;
        Utility.waitFor(() => { file.statusArquivo = TipoStatusImagem.FalhaConexao }, 500);
      });
  }

  onFileDropped(event) {
    if (!this.formulario.get('empresa').value.id) return;

    this.prepareFilesList(event);
  }

  /**
 * Trigger para o click do input file
 * @param fileDropRef (Input file)
 */
  onClickFile(fileDropRef: any) {
    if (!this.formulario.get('empresa').value.id) return;
    fileDropRef.click();
  }

  fileBrowseHandler(event) {
    this.prepareFilesList(event);
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }


  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  formatCnpj(doc: string) {
    return Utility.formatCnpj(doc);
  }

  loadBar(file: UploadImagem) {
    file.progresso = 50;

    Utility.watchCondition(this.timer, () => {
      if (file.progresso > 99) {
        return true;
      }

      file.progresso++;
      if (file.progresso >= 100) file.progresso = 100;
    }, 10)
  }

  onClickTenteNovamente(file: UploadImagem) {
    file.statusArquivo = TipoStatusImagem.Processando;
    this.loadBar(file);
    this.realizaUploadImagem(file);
  }

  onClickDelete(file: UploadImagem) {
    let index = this.files.indexOf(file);
    this.files.splice(index, 1);
  }
}
