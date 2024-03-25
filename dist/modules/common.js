import { Comparer } from "../models/enums/comparer.js";
//ids, boostrap, field, tag should be moved to enums
export const ids = {
    optionType: "optionType",
    optionTypeContainer: "optionTypeContainer",
    operator: "operator",
    operatorContainer: "operatorContainer",
    secondOperator: "secondOperator",
    secondOperatorContainer: "secondOperatorContainer",
    comparer: "comparer",
    comparerContainer: "comparerContainer",
    secondComparer: "secondComparer",
    secondComparerContainer: "secondComparerContainer",
    andComparer: "andComparer",
    stringProps: "stringProps",
    attribute: "attribute",
    attributeContainer: "attributeContainer",
    submitBtn: "submitBtn",
    submitFile: "submit",
    preSubmitFile: "preSubmit",
    uploadFile: "upload",
    resetFile: "reset",
    csvContent: "csvContent",
    csvFile: "csvFile",
};
export const bootstrap = {
    row: "row",
    col: "col",
    container: "container",
    btn: "btn",
    btnPrimary: "btn-primary",
    formGroup: "form-group",
    formControl: "form-control",
    formSelect: "form-select",
    formCheck: "form-check",
    formCheckInput: "form-check-input",
    formCheckLabel: "form-check-label",
    formSwitch: "form-switch",
    table: "table",
    trashIcon: "delete_icon",
    editableCell: "table-active",
    editedCell: "table-success",
    invalidCell: "table-danger",
};
export const field = {
    id: "id",
    name: "name",
    required: "required",
    placeholder: "placeholder",
    value: "value",
    display: "display",
    mandatory: "mandatory",
    attribute: "attribute",
    type: "type",
    rel: "rel",
    href: "href",
    for: "for",
    step: "step",
    scope: "scope",
    conditions: "conditions",
    optionsList: "options-list",
    optionsLine: "option-line",
    title: "title",
    row: "row",
    col: "col",
};
export const tag = {
    div: "div",
    span: "span",
    input: "input",
    option: "option",
    select: "select",
    head: "head",
    form: "form",
    button: "button",
    label: "label",
    thead: "thead",
    tbody: "tbody",
    table: "table",
    link: "link",
    th: "th",
    tr: "tr",
    td: "td",
    i: "i",
    p: "p",
};
export const button = {
    submit: "submit",
    button: "button",
};
function createLinkElement(href) {
    const link = document.createElement("link");
    link.setAttribute(field.rel, "stylesheet");
    link.setAttribute(field.href, href);
    return link;
}
export function importExternalUi(shadow) {
    const head = document.getElementsByTagName(tag.head)[0];
    for (let href of [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    ]) {
        const link = createLinkElement(href);
        head.appendChild(link);
        shadow.appendChild(link);
    }
}
export function isEmpty(value) {
    return ["", null, undefined].includes(value);
}
export function createElement(tagName, attributes = {}, classes = [], events = {}) {
    const element = document.createElement(tagName);
    if (classes.length > 0) {
        element.classList.add(...classes);
    }
    for (const [key, value] of Object.entries(attributes)) {
        if (!isEmpty(value))
            element.setAttribute(key, value);
    }
    for (const [key, value] of Object.entries(events)) {
        element.addEventListener(key, value);
    }
    return element;
}
export function createHtmlElement(tag, text, attributes = {}, classes = [], events = {}) {
    const button = createElement(tag, attributes, classes, events);
    button.innerText = text;
    return button;
}
export function createButton(text, attributes = {}, classes = [], events = {}) {
    return createHtmlElement(tag.button, text, attributes, classes, events);
}
export function createLabel(text, attributes = {}, classes = [], events = {}) {
    return createHtmlElement(tag.label, text, attributes, classes, events);
}
export const evaluateConditions = {
    [Comparer.gt]: (x, y) => eval(`${x}>${y}`),
    [Comparer.lt]: (x, y) => eval(`${x}<${y}`),
    [Comparer.e]: (x, y) => eval(`${x}===${y}`),
    [Comparer.gte]: (x, y) => eval(`${x}>=${y}`),
    [Comparer.lte]: (x, y) => eval(`${x}<=${y}`),
    [Comparer.in]: (x, y) => y.map(e => e.toUpperCase()).includes(x.toUpperCase()),
    regExp: (x, y) => {
        const regex = new RegExp(y);
        return regex.test(x);
    },
};
export const textPerComparer = {
    [Comparer.gt]: "greater than",
    [Comparer.lt]: "lower than",
    [Comparer.e]: "equal",
    [Comparer.gte]: "greater or equal than",
    [Comparer.lte]: "lower or equal than",
    [Comparer.in]: "in"
};
