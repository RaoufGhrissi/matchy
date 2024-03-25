import { FieldType } from "../enums/field_type.js";
export class Option {
    constructor(display_value = "", value = null, mandatory = false, type = FieldType.string, conditions = []) {
        this.display_value = display_value;
        this.mandatory = mandatory;
        this.type = type;
        this.value = value;
        this.conditions = conditions;
    }
}
