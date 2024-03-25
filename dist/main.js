var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Comparer } from "./models/enums/comparer.js";
import { ConditonProperty } from "./models/enums/conditon_property.js";
import { FieldType } from "./models/enums/field_type.js";
import { Option } from "./models/classes/option.js";
import { importExternalUi, createButton, tag, field, bootstrap, ids, createLabel, createElement, button, isEmpty, evaluateConditions, textPerComparer, } from "./modules/common.js";
import { Context } from "./models/classes/context.js";
import { Cell } from "./models/classes/cell.js";
import { UploadEntry } from "./models/classes/uploadEntry.js";
const editableCellClassName = "editableCell";
const editedCellClassName = "editedCell";
const invalidCellClassName = "invalidCell";
import * as Papa from "papaparse";
export class Matchy extends HTMLElement {
    constructor(mainOptions = []) {
        super();
        this.defaultOption = new Option();
        this.options = [];
        this.rows = [];
        this.cols = [];
        this.fileHeader = [];
        this.values = new Map();
        this.context = new Context();
        this.deletedRows = new Set();
        this.setPossibleOptions(mainOptions);
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML =
            `<style>
          table {
            font-family: Arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
          }

          table,
          th,
          td {
            border: 2px solid;
          }

          td {
            padding: 2px;
            text-align: left;
            height: 1em;
          }

          th {
            background-color: lightgray;
            text-align: left;
            padding: 8px;
          }

          tr:hover {
            background-color: #ddd;
          }

          .editableCell {
            padding: 0;
            border: none;
            border-spacing: 0;
            background-color: #ffcc00;
          }

          .editableCell input {
            padding: 0;
            width: 100%;
            margin: 0;
            outline: none;
            border-top-style: hidden;
            border-right-style: hidden;
            border-left-style: hidden;
            border-bottom-style: hidden;
            background-color: #ffcc00;
          }

          .invalidCell {
            background-color: #fd5959;
          }

          .delete_icon:hover {
            color: black;
          }

          .delete_icon:before {
            content: "x";
          }

        </style>`;
        importExternalUi(this.shadow);
        this.initializeComponent();
        this.init();
    }
    setPossibleOptions(options) {
        this.defaultOption = new Option();
        this.options = [
            this.defaultOption,
            ...options,
        ];
    }
    initializeComponent() {
        const container = createElement(tag.div, {}, [bootstrap.container]);
        const form = createElement(tag.form);
        const formGroup = createElement(tag.div, {}, [bootstrap.formGroup]);
        const selecCsvLabel = createLabel("Select CSV File :", { for: ids.csvFile });
        const fileInput = createElement(tag.input, {
            type: "file",
            id: ids.csvFile,
            name: "csvFile",
        }, ["form-control"]);
        formGroup.appendChild(selecCsvLabel);
        formGroup.appendChild(fileInput);
        form.appendChild(formGroup);
        form.appendChild(createButton("Upload", {
            id: ids.uploadFile,
            type: button.button,
        }, ["btn", "btn-primary"], { click: () => this.uploadFile() }));
        form.appendChild(createButton("Pre Submit", {
            id: ids.preSubmitFile,
            type: button.button,
        }, ["btn", "btn-primary"], { click: () => this.preSubmitFile() }));
        form.appendChild(createButton("Submit", {
            id: ids.submitFile,
            type: button.button,
        }, ["btn", "btn-success"], { click: () => this.submitFile() }));
        form.appendChild(createButton("Reset", {
            id: ids.resetFile,
            type: button.button,
        }, ["btn", "btn-success"], {
            click: () => {
                this.uploadFile();
                this.hideElementById(ids.resetFile);
                this.hideElementById(ids.submitFile);
            }
        }));
        container.appendChild(form);
        this.shadow.appendChild(container);
        const table = createElement(tag.table, { id: ids.csvContent }, [bootstrap.table, "table-hover", "table-striped"]);
        this.shadow.appendChild(table);
        this.hideElementById(ids.preSubmitFile);
        this.hideElementById(ids.submitFile);
        this.hideElementById(ids.resetFile);
    }
    init() {
        this.rows = [];
        this.cols = [];
        this.values = new Map();
        this.context = new Context();
        this.deletedRows = new Set();
    }
    onSelectOption(select, th) {
        if (!isEmpty(select.previousValue)) {
            this.shadow
                .querySelectorAll(`option[value="${select.previousValue}"]`)
                .forEach((option) => {
                option.disabled = false;
            });
        }
        if (!isEmpty(select.value)) {
            this.values.set(select.id, select.value);
            this.shadow
                .querySelectorAll(`option[value="${select.value}"]`)
                .forEach((option) => {
                option.disabled = true;
            });
        }
        else {
            this.values.delete(select.id);
        }
        select.previousValue = select.value;
        this.cols[select.id] = new Option(select.options[select.selectedIndex].text, select.value);
    }
    addOptions(th, index) {
        const select = createElement(tag.select, {
            id: index,
        });
        select.onchange = () => {
            this.onSelectOption(select, th);
        };
        for (const element of this.options) {
            const option = createElement(tag.option, {
                value: element.value,
            });
            option.innerText = element.display_value;
            select.appendChild(option);
        }
        th.appendChild(select);
    }
    generateTableHead(table) {
        const thead = table.createTHead();
        const row = thead.insertRow();
        for (const [index, col] of this.fileHeader.entries()) {
            const th = createElement(tag.th);
            const text = createElement(tag.p);
            text.innerHTML = col;
            th.appendChild(text);
            row.appendChild(th);
            this.addOptions(th, index);
        }
        this.cols = Array(this.fileHeader.length).fill(this.defaultOption);
    }
    markInvalidCell(cell, message) {
        this.addCellState(cell, invalidCellClassName);
        cell.setAttribute(field.title, message.join("\n"));
    }
    markValidCell(cell) {
        if (cell.classList.contains(invalidCellClassName)) {
            this.removeCellState(cell, invalidCellClassName);
        }
        cell.removeAttribute(field.title);
    }
    checkValidity(cell, index) {
        const value = this.values.get(String(index));
        if (isEmpty(value))
            return;
        const option = this.options.find((x) => x.value === value);
        if (option == null)
            return;
        const { valid, message } = this.checkCell(cell.innerText, option);
        if (!valid) {
            this.markInvalidCell(cell, message);
        }
        else {
            this.markValidCell(cell);
        }
    }
    removeCellState(cell, state) {
        cell.classList.remove(state);
        cell.classList.remove(bootstrap[state]);
    }
    addCellState(cell, state) {
        cell.classList.add(state);
        cell.classList.add(bootstrap[state]);
    }
    endEditMode(cell, rowIndex, colIndex) {
        const input = cell.querySelector(tag.input);
        const content = input.value;
        this.rows[rowIndex][colIndex] = content;
        cell.innerHTML = "";
        const text = document.createTextNode(this.rows[rowIndex][colIndex]);
        cell.appendChild(text);
        this.addCellState(cell, editedCellClassName);
        this.removeCellState(cell, editableCellClassName);
        if (!this.context.preSubmitFileContext)
            return;
        this.checkValidity(cell, colIndex);
    }
    startEditMode(cell, rowIndex, colIndex) {
        if (cell.classList.contains(editableCellClassName))
            return;
        this.markValidCell(cell);
        const prevContent = cell.innerText;
        const input = createElement(tag.input, { type: "text", value: prevContent }, ["form-control"], {
            blur: () => {
                this.endEditMode(cell, rowIndex, colIndex);
            }
        });
        if (cell.classList.contains(editedCellClassName)) {
            this.removeCellState(cell, editedCellClassName);
        }
        this.addCellState(cell, editableCellClassName);
        cell.innerHTML = "";
        cell.insertBefore(input, cell.firstChild);
        input.focus();
        cell.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.endEditMode(cell, rowIndex, colIndex);
            }
        });
    }
    matchyQuerySelectorAll(pattern) {
        return this.shadow.querySelectorAll(pattern);
    }
    matchyQuerySelector(pattern) {
        return this.shadow.querySelector(pattern);
    }
    hideRow(row) {
        var _a;
        (_a = this.shadow.querySelector(`tr[row="${row}"]`)) === null || _a === void 0 ? void 0 : _a.remove();
    }
    deleteRow(row) {
        this.deletedRows.add(row);
        this.hideRow(row);
    }
    generateTableBody(table) {
        for (const [rowIndex, row] of this.rows.entries()) {
            if (this.deletedRows.has(rowIndex)) {
                continue;
            }
            const tableRow = table.insertRow();
            tableRow.setAttribute(field.row, rowIndex);
            for (const [colIndex, col] of this.fileHeader.entries()) {
                const cell = tableRow.insertCell();
                cell.setAttribute(field.row, rowIndex);
                cell.setAttribute(field.col, colIndex);
                const text = document.createTextNode(row[colIndex]);
                cell.onclick = () => { this.startEditMode(cell, rowIndex, colIndex); };
                cell.appendChild(text);
            }
            const cell = tableRow.insertCell();
            const icon = createElement(tag.i, {}, [bootstrap.trashIcon], {
                click: () => {
                    const confirmDelete = confirm("Are you sure you want to delete this item ?");
                    if (!!confirmDelete) {
                        this.deleteRow(rowIndex);
                    }
                }
            });
            cell.appendChild(icon);
        }
    }
    validateFile(file) {
        if (!file) {
            alert("Please select a file.");
            return false;
        }
        if (file.type !== "text/csv") {
            alert("Please select a CSV file.");
            return false;
        }
        return true;
    }
    buildTable() {
        const table = this.shadow.querySelector("table[id='csvContent']");
        if (table == null) {
            return;
        }
        table.innerHTML = "";
        this.generateTableBody(table);
        this.generateTableHead(table);
    }
    uploadFile() {
        var _a;
        this.init();
        this.context.preSubmitFileContext = false;
        const fileInput = this.shadow.getElementById(ids.csvFile);
        const input = (_a = fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!this.validateFile(input)) {
            return;
        }
        const reader = new FileReader();
        const onload = () => {
            const csv = reader.result;
            if (csv == null)
                return;
            Papa.parse(csv, {
                delimiter: ',',
                complete: (results) => {
                    const lines = results.data;
                    this.fileHeader = lines[0].map((x) => x.trim());
                    for (const values of lines.splice(1, lines.length - 1)) {
                        const vals = values.map((x) => x.trim());
                        const uniqueVals = new Set(vals);
                        if (uniqueVals.size === 1 && uniqueVals.values().next().value === '')
                            continue;
                        this.rows.push(vals);
                    }
                    this.buildTable();
                    this.displayElementById(ids.preSubmitFile);
                },
                error: function (error) {
                    console.error(error.message);
                }
            });
        };
        reader.onload = onload;
        reader.readAsText(input);
    }
    setDisplayProp(id, prop) {
        const elt = this.shadow.getElementById(id);
        if (elt != null) {
            elt.style.display = prop;
        }
    }
    hideElementById(id) {
        this.setDisplayProp(id, "none");
    }
    displayElementById(id) {
        this.setDisplayProp(id, "inline");
    }
    preSubmitFile() {
        this.context.preSubmitFileContext = true;
        this.deleteNotMatchedRows();
        for (let colIndex = 0; colIndex < this.cols.length; colIndex++) {
            if (!this.values.has(String(colIndex)))
                continue;
            this.shadow.querySelectorAll(`tr td[col="${colIndex}"]`).forEach((td) => {
                this.checkValidity(td, colIndex);
            });
        }
        this.hideElementById(ids.preSubmitFile);
        this.displayElementById(ids.resetFile);
        this.displayElementById(ids.submitFile);
    }
    deleteNotMatchedRows() {
        this.shadow.querySelectorAll("th").forEach((th) => {
            const selectId = th.children[1].id;
            if (!this.values.has(selectId)) {
                th.remove();
                this.shadow.querySelectorAll(`td[col="${selectId}"]`).forEach(el => el.remove());
            }
        });
    }
    submit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('this should be overriden');
        });
    }
    submitFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.generateResult();
            yield this.submit(data);
        });
    }
    generateResult() {
        const content = new UploadEntry();
        for (const [rowIndex, row] of this.rows.entries()) {
            if (this.deletedRows.has(rowIndex))
                continue;
            const data = new Map();
            for (const [colIndex, header] of this.cols.entries()) {
                if (header.value == null)
                    continue;
                data.set(header.value, new Cell(row[colIndex], rowIndex, colIndex));
            }
            content.lines.push(data);
        }
        return content;
    }
    checkCell(cellValue, option) {
        if (isEmpty(cellValue)) {
            if (option.mandatory) {
                return { valid: false, message: ["Mandatory field missing"] };
            }
            else {
                return { valid: true, message: [] };
            }
        }
        const [result, msg] = this.checkType(cellValue, option.type);
        if (!result) {
            return { valid: false, message: [msg] };
        }
        const message = [];
        for (const condition of option.conditions) {
            if (!this.checkConstraint(cellValue, condition)) {
                message.push(this.getInvalidCheckMessage(condition));
            }
        }
        return {
            valid: message.length === 0,
            message
        };
    }
    getInvalidCheckMessage(condition) {
        if (!isEmpty(condition.custom_fail_message)) {
            return condition.custom_fail_message;
        }
        else if (condition.property === ConditonProperty.regex) {
            return `Text doesn't match the regex pattern ${condition.value}`;
        }
        else if (condition.property === ConditonProperty.length) {
            return `Text length is not ${textPerComparer[condition.comparer]} ${condition.value}`;
        }
        else if (condition.property === ConditonProperty.value) {
            return `Value is not ${textPerComparer[condition.comparer]} ${condition.value}`;
        }
        return "";
    }
    checkConstraint(value, condition) {
        if (condition.property === ConditonProperty.length) {
            if (condition.comparer === Comparer.in) {
                return evaluateConditions[condition.comparer](String(value.length), condition.value);
            }
            return evaluateConditions[condition.comparer](value.length, Number(condition.value));
        }
        else if (condition.property === ConditonProperty.value) {
            if (condition.comparer === Comparer.in) {
                return evaluateConditions[Comparer.in](value, condition.value);
            }
            return evaluateConditions[condition.comparer](Number(value), Number(condition.value));
        }
        else if (condition.property === ConditonProperty.regex) {
            return this.checkRegExpConditions(value, String(condition.value));
        }
    }
    checkRegExpConditions(value, conditionValue) {
        return evaluateConditions["regExp"](value, conditionValue);
    }
    isValidInteger(value) {
        const intValue = parseInt(value, 10);
        return !isNaN(intValue) && value.trim() === intValue.toString();
    }
    isValidFloat(value) {
        return !isNaN(parseFloat(value));
    }
    checkType(value, type) {
        if (type === FieldType.integer) {
            return [this.isValidInteger(value), "It's not a valid integer"];
        }
        else if (type === FieldType.float) {
            return [this.isValidFloat(value), "It's not a valid float"];
        }
        else if (type === FieldType.bool) {
            return [value in ["Yes", "No"], "Possible values are 'Yes' or 'No'"];
        }
        return [true, ""];
    }
}
customElements.define("app-matchy", Matchy);
