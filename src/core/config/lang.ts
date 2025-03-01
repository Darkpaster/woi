import russian from "./langs/russian.ts";
import english from "./langs/english.ts";
import japanese from "./langs/japanese.ts";
import espanol from "./langs/espanol.ts";
import french from "./langs/french.ts";
import german from "./langs/german.ts";
import italian from "./langs/Italian.ts";
import ukrainian from "./langs/ukrainian.ts";
import armenian from "./langs/armenian.ts";
import {settings} from "./settings.ts";

type textList = {
    ok: string;
    cancel: string;
    accept: string;
    deny: string;
    buy: string;
    sell: string;
    share: string;
    add: string;
    invite: string;
    create: string;
    offer: string;
    inspect: string;
    map: string;
    whisper: string;
    say: string;
    zap: string;
    use: string;
    open: string;
    settings: string;
    shortcuts: string;
    menu: string;
    music: string;
    sounds: string;
    inventory: string;
    chat: string;
    message: string;
    duel: string;
    mark: string;
    gold: string;
    silver: string;
    copper: string;
    empty: string;

    moveUp: string;
    moveDown: string;
    moveLeft: string;
    moveRight: string;
    turnOnAutoAttack: string;
    zoomOut: string;
    zoomIn: string;
    selectNearestTarget: string;
    openInventory: string;
    openCharacterWindow: string;
    turnOnViewMode: string;
    pickUpItem: string;
    openMap: string;

    madBoar: string;
    madBoarDescription: string;
    unknownPotion: string;
    unknownPotionDescription: string;
    slash: string;
    slashDescription: string;

    cooldownMessage: string;
    tooFarMessage: string;
    noTargetMessage: string;
    notEnoughManaMessage: string;
}

interface LangType {
    [key: string]: textList
}

export const lang: LangType = {
    ru: {
        ...russian
    },
    en: {
        ...english
    },
    ja: {
        ...japanese
    },
    es: {
        ...espanol
    },
    fr: {
        ...french
    },
    de: {
        ...german
    },
    it: {
        ...italian
    },
    uk: {
        ...ukrainian
    },
    hy: {
        ...armenian
    },
}


export function txtList(): textList {
    return lang[settings.language];
}