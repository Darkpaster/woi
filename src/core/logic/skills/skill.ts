import { defaultSkill } from "../../graphics/static/paths.ts";
import { calcDistance, randomInt, scaledTileSize } from "../../../utils/math.ts";
import { CallbackTimer } from "../../../utils/time.ts";
import { Mob } from "../actors/mobs/mob.ts";
import { Player } from "../actors/player.ts";
import { log } from "../logs.ts";
import {EntityUIInfo} from "../actors/actor.ts";
import {AnimatedEffect, AnimatedImageManager} from "../../graphics/image.ts";

export class Skill implements EntityUIInfo {
    get sprite(): string | null | undefined {
        return this._sprite;
    }

    set sprite(value: string | null) {
        this._sprite = value;
    }
    static damageType: { PHYSICAL: string; MAGICAL: string; ABSOLUTE: string } = {
        PHYSICAL: "physical",
        MAGICAL: "magical",
        ABSOLUTE: "absolute"
    };

    get image(): AnimatedImageManager | null | undefined {
        return this._image;
    }

    set image(value: AnimatedImageManager | null) {
        this._image = value;
    }
    get note(): string | undefined {
        return this._note;
    }

    set note(value: string) {
        this._note = value;
    }
    get rarity(): "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" {
        return this._rarity;
    }

    set rarity(value: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike") {
        this._rarity = value;
    }
    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _name: string = "Item";
    private _image?: AnimatedImageManager | null;
    private _sprite?: string | null;
    private _description: string = "No description";
    private _note?: string;
    private _rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" = "common";

    private bind: any | null;
    public icon: string;
    public animation: AnimatedEffect | null;
    public minDamage: number;
    public maxDamage: number;
    public damageType: string;
    public range: number;
    public cost: number;
    public owner: Mob | Player;
    public delay: number;
    public cooldown: number;
    public process: CallbackTimer;

    constructor(owner: Mob | Player) {
        this.bind = null;
        this.name = "Unknown skill";
        this.icon = defaultSkill;
        this.animation = null;
        this.description = "No description";
        this.note = "";
        this.minDamage = 2;
        this.maxDamage = 6;
        this.damageType = Skill.damageType.PHYSICAL;
        this.range = 3;
        this.cost = 0;
        this.owner = owner;
        this.delay = 200;
        this.cooldown = 5000;

        this.process = new CallbackTimer(() => {
            this.execute();
            // this.owner.
            // owner.renderState = "attack";
        },
            this.delay, new CallbackTimer(() => { }, this.cooldown));
    }

    useSkill(): boolean {
        if (this.owner.image!.currentAnimation.disposable) {
            this.owner.renderState = "idle";
        }
        
        if (this.range < calcDistance(this.owner, this.owner.target!) / scaledTileSize()) {
            this.stop();
            log("system", `${this.owner.target!.name} is out of range!`, "red");
            return false;
        }
        
        if (this.process.cooldown!.getLeftTime() > 0) {
            log("system", `${this.name} is on cooldown!`, "red");
        } else {
            this.animation!.create(this.owner.target!.x, this.owner.target!.y);
        }

        
        if (!this.process.id) {
            this.process.start();
            if (this.process.cooldown!.done) {
                return false;
            }
            
         } else {
             if (!this.process.cooldown!.done) {

             }
         }
         
         return true
     }

     execute(): void {
         let realDamage: number = randomInt(this.minDamage, this.maxDamage);
         
         if (this.owner.target.defenseType === this.damageType) {
             realDamage -= target.defense; 
         }
         
         this.owner.target!.dealDamage(realDamage, this.owner);
     }

     stop(): void {
         if (this.process) {
             this.process.stop();
         }
     }

     left(): void {
         return void(this.process.cooldown);
     }
}