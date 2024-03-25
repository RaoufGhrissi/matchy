import { Comparer } from "../enums/comparer.js";
export class Condition {
    constructor(property, value, comparer = Comparer.e, custom_fail_message = null) {
        this.property = property;
        this.comparer = comparer;
        this.value = value;
        this.custom_fail_message = custom_fail_message;
    }
}
