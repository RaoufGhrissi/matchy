export class Cell {
    value: string;
    rowIndex: number;
    colIndex: number;

    constructor(value: string, rowIndex: number, colIndex: number) {
        this.value = value;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }
}

