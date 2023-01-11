import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { TipoFilterField } from '../../core/enums/tipo-filter-field.enum';
import { FieldOption } from '../../core/models/grid-filter/field-option.model';
import { FilterFieldReturn } from '../../core/models/grid-filter/filter-field-return.model';
import { FilterField } from '../../core/models/grid-filter/filter-field.model';

@Component({
  selector: 'app-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.scss']
})
export class FilterFieldComponent implements OnInit {

  formularioFiltro: FormGroup;
  labelInsideFilter: string = null;
  listOptionsSelected: FieldOption[] = [];
  requiredFieldsError: boolean = false;
  minDate: Date;
  maxDate: Date;
  erroDataFinal: boolean = false;
  customControls: Map<string, AbstractControl>;

  @Input() field: FilterField;
  @Input() control: FormControl;
  @Input() searchControl: FormControl;
  @Input('customControls') set setCustomControls(value) { this.customControls = value; }
  @Input('redefinirField') set setRedefinir(value) { this.redefinir(); }
  @Output('selectAll') selectAll: EventEmitter<FilterFieldReturn> = new EventEmitter<FilterFieldReturn>();
  @Output('searchInput') searchInput: EventEmitter<FieldOption> = new EventEmitter<FieldOption>();
  @Output('triggerSearch') triggerSearch: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('allSelectedOptions') private allSelectedOptions: MatOption;

  constructor() { }

  ngOnInit(): void {
    this.setLabel();
  }

  toggleSelectAllOptions() {
    this.selectAll.emit(<FilterFieldReturn>{ field: this.field, selected: this.allSelectedOptions.selected ? true : false });
  }

  setLabel() {
    this.labelInsideFilter = this.field.titulo;
    if (this.labelInsideFilter.includes('Filtre')) { this.labelInsideFilter = this.labelInsideFilter.replace('Filtre ', ''); }

    let first = this.labelInsideFilter.substr(0, 1).toUpperCase();
    this.labelInsideFilter = first + this.labelInsideFilter.substr(1);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  redefinir() {
    this.control.reset();
    if (this.field.searchInput) {
      this.searchControl.reset();
      this.onChangeSearch(null, true);
    }

    if (this.field.tipo == TipoFilterField.Period) {
      this.getFormControl('De')?.reset();
      this.getFormControl('Ate')?.reset();
    }
  }

  onChangeSearch(value: string, reset?: boolean) {
    if (reset || value == '') {
      this.searchInput.emit(<FieldOption>{ label: this.field.id, value: '' });
      if (reset) {
        this.listOptionsSelected = [];
        return
      }

      this.updateOptions();
      return;
    }

    if (value.length >= 3) {
      this.searchInput.emit(<FieldOption>{ label: this.field.id, value: value });
      this.updateOptions();
    }
  }

  updateOptions() {
    Utility.waitFor(() => {
      this.listOptionsSelected.forEach(selected => {
        let option = this.field.options.filter(op => op.value == selected.value)[0];
        if (option) {
          this.field.options.splice(this.field.options.indexOf(option), 1);
        }
      });
    }, 1000);
  }

  setControlValue() {
    let options = [];
    this.listOptionsSelected.forEach(op => { options.push(op.value); });
    this.control.patchValue(options);

    this.listOptionsSelected.forEach(selected => {
      let option = this.field.options.filter(op => op.value == selected.value)[0];
      if (option) {
        this.field.options.splice(this.field.options.indexOf(option), 1);
      }
    });
  }

  toggleOption(option) {
    if (!this.field.searchInput) {
      const index: number = this.control.value?.indexOf('selectAll');
      const valores = this.control.value;
      let valoresAux = valores;

      if (index !== undefined && index !== -1) {
        valoresAux = valores.splice(index, 1);
        if (this.field.options.length == valoresAux.length) { return; }
        this.allSelectedOptions.deselect();
        return;
      }

      if (this.field.options.length == valoresAux.length) { this.allSelectedOptions.select(); }
      return;
    }

    let selected = this.listOptionsSelected.filter(o => o.value == option.value)[0];
    if (selected) {
      this.listOptionsSelected.splice(this.listOptionsSelected.indexOf(selected), 1);
      this.setControlValue();
      return;
    }

    this.listOptionsSelected.push(option);
    this.setControlValue();
  }

  onKeyEnter(event) {
    if (event.key != "Enter") return;
    this.triggerSearch.emit(true);
  }

  getFormControl(id: string): AbstractControl {
    if (this.customControls) { return this.customControls?.get(id); }
    return new FormControl();
  }

  cleanDates() {
    this.getFormControl('De').reset();
    this.getFormControl('Ate').reset();
    Utility.waitFor(() => { this.validaCamposObrigatorios(); }, 500)
  }

  onChangePeriodo(value: any, inicial: boolean) {
    this.control.reset();

    if (inicial) {
      this.setaDataMinima(value);
      this.validaCamposObrigatorios();
      return;
    }

    this.verificaData(value);
    this.validaCamposObrigatorios();
  }

  setaDataMinima(dataFinal: any) {
    let data1
    data1 = Utility.formatDate(dataFinal)
    const data1Split = data1.split('-')
    this.minDate = new Date(data1Split[2], data1Split[1] - 1, data1Split[0]);
    let date = new Date(data1Split[2], data1Split[1] - 1, data1Split[0]);
    date.setDate(this.minDate.getDate() + this.field.maxDays);
    this.maxDate =  date;
  }

  verificaData(dataFinal: any) {
    let data1
    let data2
    data1 = Utility.formatDate(this.getFormControl('De').value)
    data2 = Utility.formatDate(dataFinal)

    if (data1 !== '' && data2 !== '') {
      const data1Split = data1.split('-')
      const data2Split = data2.split('-')
      const novaData1 = new Date(data1Split[2], data1Split[1] - 1, data1Split[0])
      const novaData2 = new Date(data2Split[2], data2Split[1] - 1, data2Split[0])

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false
      } else {
        this.erroDataFinal = true
        this.getFormControl('Ate').setValue('')
      }
    }
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return `${TipoElemento[tipoElemento]}-${nomeElemento}${guidElemento != null ? '_' + guidElemento : ''}`;
  }

  triggerFocus(id: string) {
    //focar o elemento pelo ID
    document.getElementById(this.getElementId(0, 'filter', id)).focus();
  }

  private validaCamposObrigatorios() {
    if (!this.control.value && (!this.getFormControl('De').value || !this.getFormControl('Ate').value)) {
      this.requiredFieldsError = true;
      return false;
    }

    this.requiredFieldsError = false;
    return true;
  }
}
