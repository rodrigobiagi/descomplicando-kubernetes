import { FormControl, Validators } from "@angular/forms";
import { TipoFilterField } from "../../enums/tipo-filter-field.enum";
import { FieldOption } from "./field-option.model";
import { FilterCustomField } from "./filter-custom-field.model";

export class FilterField {
    id: string;
    titulo: string;
    tipo: TipoFilterField;
    options?: FieldOption[];
    validators?: Validators;
    selectAllOptions?: string;
    customFields?: FilterCustomField[];
    searchInput?: boolean;
    maxDays?: number;
}