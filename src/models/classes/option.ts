import { FieldType } from "../enums/field_type.js";
import { Condition } from "./condition.js";

export class Option {
    display_value: string;
    value: string | null;
    mandatory: boolean;
    type: FieldType;
    conditions: Condition[];

    constructor(display_value: string = "", value: string | null  = null, mandatory: boolean = false, type: FieldType = FieldType.string, conditions: Condition[] = []) {
        this.display_value = display_value;
        this.mandatory = mandatory;
        this.type = type;
        this.value = value;
        this.conditions = conditions;
    }
}