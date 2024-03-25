import { Comparer } from "../enums/comparer.js";
import { ConditonProperty } from "../enums/conditon_property.js";

export class Condition {
    property: ConditonProperty;
    comparer: Comparer;
    value: number | string | string[];
    custom_fail_message: string | null;

    constructor(property: ConditonProperty, value: number | string | string[], comparer: Comparer = Comparer.e, custom_fail_message: string | null = null) {
        this.property = property;
        this.comparer = comparer;
        this.value = value;
        this.custom_fail_message = custom_fail_message;
    }
}