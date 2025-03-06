import {calcDistance, calcDistanceX, calcDistanceY, randomInt, scaledTileSize} from "../../../../utils/math.ts";
import {TimeDelay} from "../../../../utils/time.ts";
import {player} from "../../../main.ts";

import {Actor} from "../actor.ts";

export class Mob extends Actor {
    static states: { [key: string]: string } = {
        WANDERING: "wandering",
        CHASING: "chasing",
        FLEEING: "fleeing"
    }

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
        // this.spawn();
    }

    // private spawn(): void {
    //     Mob.mobList.push(this);
    //     this.x = scaledTileSize() * randomInt(getCurrentLocation().floor[0].length - 1);
    //     this.y = scaledTileSize() * randomInt(getCurrentLocation().floor[0].length - 1);
    //
    //     let cond = getWallTile(this.posX, this.posY).props.isWalkable;
    //     while (!cond) {
    //         this.x = scaledTileSize() * randomInt(getCurrentLocation().floor[0].length - 1);
    //         this.y = scaledTileSize() * randomInt(getCurrentLocation().floor[0].length - 1);
    //         const test = getWallTile(this.posX, this.posY);
    //         cond = test.props.isWalkable;
    //     }
    // }

    get agroRadius(): number {
        return scaledTileSize() * this._agroRadius;
    }

    set agroRadius(r: number) {
        this._agroRadius = r;
    }

    static getMobsOnTile(x: number, y: number): Mob[] {
        const result: Mob[] = []
        // for (const mob of Mob.mobList) {
        //     if (mob.posX === Math.floor(x / scaledTileSize())
        //         && mob.posX === Math.floor(y / scaledTileSize())) {
        //         result.push(mob);
        //     }
        // }
        return result
    }

    update(): { x: number; y: number } | null {

        const diff = {x: this.x, y: this.y};

        this.setState();

        // Assuming events is a method that exists in the context.
        // If it's not defined yet, the type should be adjusted accordingly.
        // The following line may need to be updated based on the actual implementation.
        this.events();

        // const collision = this.collision(Mob.mobList);

        // if (collision.x) {
        //     this.x = diff.x;
        // }
        //
        // if (collision.y) {
        //     this.y = diff.y;
        // }

        this.offsetX = diff.x = diff.x - this.x;
        this.offsetY = diff.y = diff.y - this.y;

        return diff;
    }

    setState(): void {
        if (this.state !== Mob.states.CHASING && calcDistance(player, this) < this.agroRadius) {
            this.state = Mob.states.CHASING;
            this.renderState = "walk";
            this.target = player;
        } else {
            if (this.state === Mob.states.WANDERING) {
                return
            }
            this.state = Mob.states.WANDERING;
            this.renderState = "idle";
            this.target = null;
        }
    }

    // checkVisibility(): boolean {
    //     const directPath = this.getDirectPathTiles();
    //     return directPath.every((value) => value.walkable);
    // }

    events(): void {
        if (this.state === Mob.states.CHASING) {
            if (!this.attackEvents()) {
                this.chase();
            }
        } else if (this.state === Mob.states.WANDERING) {
            this.wander();
        } else if (this.state === Mob.states.FLEEING) {
            this.flee();
        }
    }

    chase(): void {
        if (player.x - this.x > 0) {
            this.x += this.moveSpeed;
            this.direction = "right";
        } else if (player.x - this.x < 0) {
            this.x -= this.moveSpeed;
            this.direction = "left";
        }

        if (player.y - this.y > 0) {
            this.y += this.moveSpeed;
        } else if (player.y - this.y < 0) {
            this.y -= this.moveSpeed;
        }
    }

    // calcPath(): void {
    // }

    // getDirectPathTiles(): Array<any> {
    //     const ray = {x: player.x, y: player.y};
    //     const tilesNum = Math.floor(calcDistance(player, this) / scaledTileSize());
    //     const pathX = calcDistanceX(player, this);
    //     const pathY = calcDistanceY(player, this);
    //
    //     const offsetX = pathX / tilesNum || 0;
    //     const offsetY = pathY / tilesNum || 0;
    //
    //     const foundTiles: Array<any> = [];
    //
    //     const pX = player.x - this.x < 0;
    //     const pY = player.y - this.y < 0;
    //
    //     for (let i = 1; i <= tilesNum; i++) {
    //         ray.x += pX ? offsetX : -offsetX;
    //         ray.y += pY ? offsetY : -offsetY;
    //
    //         const tileX: number = Math.floor(ray.x / scaledTileSize());
    //         const tileY: number = Math.floor(ray.y / scaledTileSize());
    //
    //         foundTiles.push(tiles[getCurrentLocation().floor[tileY][tileX]].props);
    //     }
    //
    //     return foundTiles;
    // }

    wander(): void {
        let direction: number = randomInt(200);

        switch (direction) {
            case 0:
                this.x += this.moveSpeed / 2;
                this.direction = "right";
                break;
            case 1:
                this.x -= this.moveSpeed / 2;
                this.direction = "left";
                break;
            case 2:
                this.y += this.moveSpeed / 2;
                break;
            case 3:
                this.y -= this.moveSpeed / 2;
                break;
        }
    }

    flee(): void {
        if (this.x < player!.x) {
            this.x -= this.moveSpeed;
            this.direction = "left";
        } else if (this.x > player!.x) {
            this.x += this.moveSpeed;
            this.direction = "right";
        } else if (this.y < player!.y) {
            this.y -= this.moveSpeed;
        } else if (this.y > player!.y) {
            this.y += this.moveSpeed;
        }
    }

    // spellEvents(): boolean {
    //     let success: boolean = false;
    //
    //     for (const spell of this.spellbook) {
    //         success = spell.useSkill(this, player);
    //    }
    //
    //    return success;
    // }

    dealDamage(damage: number, source: any = null): void {
        super.dealDamage(damage, source);
        if (this.HP <= 0) {
            this.die();
            player!.target = null;
        }
    }


    die(): void {
        // Mob.mobList.splice(Mob.mobList.indexOf(this), 1);
    }
}
