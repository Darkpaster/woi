export class Item {
    rarity: string;
    stackable: boolean;
    actions: any[];
    note: string;

    constructor() {
        this.rarity = "common";
        this.stackable = false;
        this.actions = [];
        this.note = "";
    }
}