import {TimeDelay} from "../../../../utils/general/time.ts";

import {Actor} from "../actor.ts";

import {scaledTileSize} from "../../../../utils/math/general.ts";


export default class Mob extends Actor {
    static states: { [key: string]: string } = {
        WANDERING: "wandering",
        CHASING: "chasing",
        FLEEING: "fleeing"
    }

    static mobTypes: { [key: string]: string } = {
        RABBIT: "rabbit",
        MAD_BOAR: "mad_boar",
        SLIME: "slime",
        PLANT: "plant",
        FAIRY: "fairy",
        GOLEM: "golem",
    }
    //
    // static getMobByType(type: string) {
    //    switch (type) {
    //        case this.mobTypes.RABBIT:
    //            return new Rabbit();
    //        case this.mobTypes.MAD_BOAR:
    //            return new MadBoar();
    //    }
    // }

    state: string;
    timer: TimeDelay;
    idle: boolean;
    private _agroRadius: number;

    constructor() {
        super();
        this.state = Mob.states.WANDERING;
        this.timer = new TimeDelay(1000);
        this.idle = true;
        this._agroRadius = 5;
        this.fearFactor = 10;
    }


    get agroRadius(): number {
        return scaledTileSize() * this._agroRadius;
    }

    set agroRadius(r: number) {
        this._agroRadius = r;
    }

}
