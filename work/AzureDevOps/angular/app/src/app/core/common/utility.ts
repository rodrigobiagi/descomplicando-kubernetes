import { ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MaskApplierService } from 'ngx-mask';
import { Documento } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/common/documento.model';
import { ContratoCamposEditaveis } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/contratos/contrato-campos-editaveis.model';
import { appInjector } from 'src/app/modules/produtos/sub-modules/e-contrato/e-contrato.module';
import { TipoElemento } from '../enums/tipo-elemento.enum';

export class Utility {

    static formatDate(value: string): string {

        if (value == null || value == undefined || value == '')
            return null;
        return moment(value, 'DD-MM-YYYY').format('DD-MM-YYYY');
    }

    static formatDateTime(value: string): string {
        if (value == null || value == undefined || value == '')
            return null;
        return moment(value).format('DD-MM-YYYY [às] HH:mm');
    }

    static formatCurrency(value: string): string {

        if (value == null || value == undefined || value == '')
            return null;

        const maskService = appInjector.get(MaskApplierService);

        maskService.decimalMarker = '.';
        maskService.thousandSeparator = ',';
        maskService.prefix = 'R$ ';

        let currency = maskService.applyMask(parseFloat(value).toFixed(2), 'separator.2');

        currency = currency.replace(',', '-')
        currency = currency.replace('.', ',')
        currency = currency.replace('-', '.')


        return currency;
    }

    static currentYear(): number {
        return new Date().getFullYear();
    }

    static formatCnpj(value: string): string {

        if (value == null || value == undefined || value == '')
            return '';

        let maskService = appInjector.get(MaskApplierService);

        maskService.prefix = '';

        return maskService.applyMask(value, '00.000.000/0000-00');
    }

    static formatCpf(value: string): string {
        if (value == null || value == undefined || value == '')
            return '';

        let maskService = appInjector.get(MaskApplierService);

        maskService.prefix = '';

        return maskService.applyMask(value, '000.000.000-00');
    }

    /**
     * Executa a função após o tempo determinado
     * @param {function} action
     * @param {number} ms
    */
    static waitFor(action: () => void, ms: number): void {
        setTimeout(() => { action() }, ms);
    }

    /**
     * Executa a função a cada ms (tempo determinado) até que a função retorne verdadeiro
     * @param {function} action
     * @param {number} ms
     */
    static watchCondition(timer: NodeJS.Timeout, action: () => boolean, ms: number): void {
        timer = setInterval(() => {
            if (action()) { Utility.stopWatchCondition(timer); }
        }, ms);
    }

    static stopWatchCondition(timer: NodeJS.Timeout) {
        clearInterval(timer);
    }

    static isValidDate() {
        return (control: AbstractControl): Validators => {
            let ctrlValue = control.value;

            if (ctrlValue) {
                if (!ctrlValue.includes("-")) { ctrlValue = ctrlValue.substring(0, 2) + "-" + ctrlValue.substring(2, 4) + "-" + ctrlValue.substring(4, 8); }

                var day: number = +ctrlValue.substring(0, 2);
                var month: number = +ctrlValue.substring(3, 5);
                var year: number = +ctrlValue.substring(6, 10);

                if (day <= 0 || month <= 0 || year < 1971 || year > 2999) { return { dateNotValid: true }; }
            }
            return null;
        };
    }

    static isValidCpf() {
        return (control: AbstractControl): Validators => {
            let cpf = control.value;

            if (cpf) {
                let numbers, digits, sum, i, result, equalDigits;
                equalDigits = 1;

                if (cpf.length < 11) {
                    return { documentNotValid: true };
                }

                cpf = cpf.replace('.', '').replace('.', '').replace('-', '');

                for (i = 0; i < cpf.length - 1; i++) {
                    if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
                        equalDigits = 0;
                        break;
                    }
                }

                if (cpf == "00000000000" ||
                    cpf == "11111111111" ||
                    cpf == "22222222222" ||
                    cpf == "33333333333" ||
                    cpf == "44444444444" ||
                    cpf == "55555555555" ||
                    cpf == "66666666666" ||
                    cpf == "77777777777" ||
                    cpf == "88888888888" ||
                    cpf == "99999999999")
                    return { documentNotValid: true };

                if (!equalDigits) {
                    numbers = cpf.substring(0, 9);
                    digits = cpf.substring(9);
                    sum = 0;
                    for (i = 10; i > 1; i--) {
                        sum += numbers.charAt(10 - i) * i;
                    }

                    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

                    if (result !== Number(digits.charAt(0))) {
                        return { documentNotValid: true };
                    }
                    numbers = cpf.substring(0, 10);
                    sum = 0;

                    for (i = 11; i > 1; i--) {
                        sum += numbers.charAt(11 - i) * i;
                    }
                    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

                    if (result !== Number(digits.charAt(1))) {
                        return { documentNotValid: true };
                    }
                    return null;
                } else {
                    return { documentNotValid: true };
                }
            }
            return null;
        };
    }

    static isValidCnpj() {
        return (control: AbstractControl): Validators => {
            const value = control.value;

            if (!value) return null

            let cnpj = value.replace(/[^\d]+/g, '');
            if (cnpj == '') return { documentNotValid: true };
            if (cnpj.length != 14)
                return { documentNotValid: true };

            if (cnpj == "00000000000000" ||
                cnpj == "11111111111111" ||
                cnpj == "22222222222222" ||
                cnpj == "33333333333333" ||
                cnpj == "44444444444444" ||
                cnpj == "55555555555555" ||
                cnpj == "66666666666666" ||
                cnpj == "77777777777777" ||
                cnpj == "88888888888888" ||
                cnpj == "99999999999999")
                return { documentNotValid: true };

            let tamanho = cnpj.length - 2
            let numeros = cnpj.substring(0, tamanho);
            let digitos = cnpj.substring(tamanho);
            let soma = 0;
            let pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return { documentNotValid: true };

            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return { documentNotValid: true };

            return null;
        }
    }

    static formatDocument(documento: Documento) {
        if (documento.tipoDocumento == 1) {
            return documento.numero.replace(/(\d{3})?(\d{3})?(\d{3})?(\d{2})/, "$1.$2.$3-$4");
        }

        return documento.numero.replace(/(\d{2})?(\d{3})?(\d{3})?(\d{4})?(\d{2})/, "$1.$2.$3/$4-$5")
    }

    static formatCep(cep: string) {
        return cep.replace(/(\d{5})?(\d{3})/, "$1-$2");
    }

    static formatCurrencyValue(valor: number) {
        if (valor == null) return;
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    static enableFields(formulario: FormGroup, fieldsConfig: ContratoCamposEditaveis[], ref: ChangeDetectorRef) {
        fieldsConfig.forEach(config => {
            ref.detectChanges();
            if (config.enable) {
                formulario.get(config.field).enable();
                return;
            }

            formulario.get(config.field).disable();
        })
    }

    static isNullOrEmpty(value: string) {
        return value == "" || value == null;
    }

    static changeFieldValidators(form: FormGroup, field: string, validators: ValidatorFn[]) {
        if (!this.isNullOrEmpty(field)) {
            form.get(field).setValidators(Validators.compose(validators));
            form.get(field).updateValueAndValidity();
        }
    }

    static dynamicValidator(condition: () => boolean, invalidIdentifier: string) {
        return (control: AbstractControl): Validators => {
            if (!condition()) return { invalidIdentifier: invalidIdentifier };
            return null;
        }
    }

    static detectMimeType(base64: string) {
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

    /**
     * Altera os 3 últimos caracteres por pontos
     * @param {function} action
     * @param {number} maxLength
     * @param {string} value
     * @param {string} typeCharacter
     */
    static changeCharacterFieldValue(value: string, maxLength: number, typeCharacter: string) {
        return `${value.slice(0, maxLength)}${typeCharacter}`
    }

    static formatGridDate(date: string) {
        if (date == undefined) return
        if (Utility.isNullOrEmpty(date)) return

        return date.slice(0, date.length - 3)
    }

    static isValidEmailTBK() {
        return (control: AbstractControl): Validators => {
            let email = control.value;

            if (email) {
                if (!email.endsWith('@tecnobank.com.br'))
                    return { emailTBKInvalid: true };
            }
            return null;
        };
    }

    static isValidName() {
        return (control: AbstractControl): Validators => {
            let nome: string = control.value;

            if (nome) {
                if (nome.toUpperCase() == 'MASTER' || nome.toUpperCase() == 'MÁSTER')
                    return { nameInvalid: true };
            }
            return null;
        };
    }

    static getElementId(tipoElemento: TipoElemento, nomeElemento: string, guidElemento: any = null) {
        return `${TipoElemento[tipoElemento]}-${nomeElemento}${guidElemento != null ? '_' + guidElemento : ''}`;
    }
}
