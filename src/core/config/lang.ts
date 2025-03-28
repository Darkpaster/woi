import russian from "./langs/russian.ts";
import english from "./langs/english.ts";
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
    rabbit: string;
    rabbitDescription: string;
    slime: string;
    slimeDescription: string;
    bear: string;
    bearDescription: string;

    werewolf: string;
    werewolfDescription: string;
    dwarf: string;
    dwarfDescription: string;
    elf: string;
    elfDescription: string;
    human: string;
    humanDescription: string;
    orc: string;
    orcDescription: string;
    hobbit: string;
    hobbitDescription: string;
    vampire: string;
    vampireDescription: string;
    golem: string;
    golemDescription: string;
    berserk: string;
    berserkDescription: string;
    fairy: string;
    fairyDescription: string;
    ancientElf: string;
    ancientElfDescription: string;

    unknownPotion: string;
    unknownPotionDescription: string;
    slash: string;
    slashDescription: string;

    cooldownMessage: string;
    tooFarMessage: string;
    noTargetMessage: string;
    notEnoughManaMessage: string;

    tree: string;
    treeDescription: string;
    grass: string;
    grassDescription: string;
    dirt: string;
    dirtDescription: string;
    stone: string;
    stoneDescription: string;
    rock: string;
    rockDescription: string;
    mountain: string;
    mountainDescription: string;
    water: string;
    waterDescription: string;
    darkness: string;
    darknessDescription: string;
}

type LangType = Record<string, textList>;

export const lang: LangType = {
    ru: {
        ...russian
    },
    en: {
        ...english
    },
    // ja: {
    //     ...japanese
    // },
    // es: {
    //     ...espanol
    // },
    // fr: {
    //     ...french
    // },
    // de: {
    //     ...german
    // },
    // it: {
    //     ...italian
    // },
    // uk: {
    //     ...ukrainian
    // },
    // hy: {
    //     ...armenian
    // },
}


export function txtList(): textList {
    return lang[settings.language];
}