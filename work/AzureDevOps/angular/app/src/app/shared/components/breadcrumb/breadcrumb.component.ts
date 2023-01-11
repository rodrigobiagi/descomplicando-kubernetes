import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BreadcrumbComponent implements OnInit {

  titulo: string;
  urlSegments: number = 0;
  currentUrl: string = '';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        return this.obterTitulo();
      }),
    ).subscribe((titulo: string | null) => {
      this.titulo = titulo;
    });

    this.titulo = this.obterTitulo();
  }

  obterTitulo(): string | null {
    let child = this.route.firstChild;
    while (child) {
      this.urlSegments = child.url['_value'].length;
      this.currentUrl = child['_routerState'].snapshot.url;

      if (child.firstChild) {
        child = child.firstChild;
      } else if (child.snapshot.data && child.snapshot.data['breadcrumb']) {
        return child.snapshot.data['breadcrumb'];
      } else {
        return null;
      }
    }
    return null;
  }

  voltarPagina() {
    this.router.navigate([`${this.getUrlSegments()}`], { relativeTo: this.route })
  }

  getUrlSegments() {
    let url = '';
    let segments = this.currentUrl.split('/');

    for (let i = 0; i < (segments.length - this.urlSegments); i++) { url += `/${segments[i]}`; }

    return url;
  }

  showIcon() {
    let url = this.currentUrl.slice(0, this.currentUrl.lastIndexOf('/')).split('/');
    var filtered = url.filter((el) => { if (el) return el; });
    return filtered.length > 1;
  }

  public getElementId(tipoElemento: TipoElemento, nomeElemento: string, guidElemento: any = null) {
    return `${TipoElemento[tipoElemento]}-${nomeElemento}${guidElemento != null ? '_' + guidElemento : ''}`;
  }
}
