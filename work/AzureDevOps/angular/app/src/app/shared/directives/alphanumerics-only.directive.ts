import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[alphanumerics-only]'
})
export class AlphanumericsOnlyDirective {

  constructor(private elRef: ElementRef, private control: NgControl) { }

  @Input('alphanumerics-only') condition: string[] = [];

  @HostListener('input', ['$event']) onInputChange(event) {
    if (this.condition.length > 0 && this.condition.filter(cond => cond == 'subvirgula').length > 0) { // substitui a virgula por ponto
      this.elRef.nativeElement.value = this.elRef.nativeElement.value.replace(/,/g, '.');
    }

    const initialValue = this.elRef.nativeElement.value;
    var condicao = /[^a-zA-Z\d]*/g;

    if (this.condition.length > 0) { condicao = this.getRegex(this.condition); }

    this.elRef.nativeElement.value = initialValue.replace(condicao, '');
    this.control.control.setValue(this.elRef.nativeElement.value);

    if (initialValue !== this.elRef.nativeElement.value) {
      event.stopPropagation();
    }
  }

  getRegex(condition: string[]) {
    var condicao = '[^a-zA-Z\\\d';

    condition.forEach(element => {
      switch (element) {
        case 'acento':
          let acento = '\\u00C0' + '-' + '\\u017F';
          condicao += acento;
          break;

        case 'espaco':
          let espaco = '\\\s';
          condicao += espaco;
          break;

        case 'ponto':
          let ponto = '.';
          condicao += ponto;
          break;

        default: break;
      }
    });

    if (condition.findIndex(a => a == 'hifen') > 0) { condicao += '-'; } //hifen precisa estar no final da expressao

    return new RegExp(condicao + ']*', 'g');
  }
}
