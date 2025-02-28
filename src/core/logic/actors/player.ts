import { villagerManager } from "../../graphics/static/managers.ts";
import { calcDistance, scaledTileSize } from "../../../utils/math.ts";
import { smallPotionOfHealing } from "../items/consumable/potions/smallPotionOfHealing.ts";
import { Slash } from "../skills/slash.ts";
import { Actor } from "./actor.ts";
import { Mob } from "./mobs/mob.ts";

interface Equipment {
	head: any;
	body: any;
	legs: any;
	boots: any;
	arms: any;
	weapon: any;
	shield: any;
	accessory: any;
	ring1: any;
	ring2: any;
}



export class Player extends Actor {
	AA: boolean;
	inventory: Array<any>;
	equipment: Equipment;
	strength: number;
	dexterity: number;
	intelligence: number;
	wisdom: number;
	constitution: number;
	charisma: number;
	luck: number;
	experience: number;
	level: number;
	gold: number;
	inventorySize: number;
	equipmentSize: number;
	skillPoints: number;

	public pressDown: boolean = false;
	public pressUp: boolean = false;
	public pressLeft: boolean = false;
	public pressRight: boolean = false;

	constructor() {
		super();
		this.x += scaledTileSize() * 20;
		this.HP = 500;
		this.HT = 500;
		this.minDamage = 15;
		this.maxDamage = 35;
		this.criticalChance = 0.3;
		this.moveSpeed = 4;
		this.AA = true;
		this.image = villagerManager;
		this.name = "Player";
		this.inventory = new Array(200);
		this.spellBook = [new Slash(this), null, null, null, null, null, null, null];

		for (let i = 0; i < this.inventory.length / 10; i++) {
			this.inventory[i] = new smallPotionOfHealing();
		}

		this.equipment = {
			head: null,
			body: null,
			legs: null,
			boots: null,
			arms: null,
			weapon: null,
			shield: null,
			accessory: null,
			ring1: null,
			ring2: null
		};

		this.strength = 10,
			this.dexterity = 10,
			this.intelligence = 10,
			this.wisdom = 10,
			this.constitution = 10,
			this.charisma = 10,
			this.luck = 10,
			this.experience = 0,
			this.level = 1,
			this.gold = 0,
			this.inventorySize = 20,
			this.equipmentSize = 6,
			this.skillPoints = 0;


	}

	pickUp(item: any): void {
		this.inventory.push(item);
	}

	drop(item: any): void {
		const index = this.inventory.indexOf(item);
		if (index > -1) {
			this.inventory.splice(index, 1);
		}
	}

	equip(item: any): void {
		this.equipmentSlot(item);
		this.drop(item);
	}

	unEquip(item: any): void {
		this.pickUp(item);
		this.equipmentSlot(null);
	}


	equipmentSlot(item?: any): void {
		if (item && item.type === "head") {
			this.equipment.head = item;
		}
		if (item && item.type === "body") {
			this.equipment.body = item;
		}
		if (item && item.type === "legs") {
			this.equipment.legs = item;
		}
		if (item && item.type === "boots") {
			this.equipment.boots = item;
		}
		if (item && item.type === "arms") {
			this.equipment.arms = item;
		}
		if (item && item.type === "weapon") {
			this.equipment.weapon = item;
		}
		if (item && item.type === "shield") {
			this.equipment.shield = item;
		}
		if (item && item.type === "accessory") {
			this.equipment.accessory = item;
		}
		if (item && item.type === "ring") {
			if (!this.equipment.ring1) {
				this.equipment.ring1 = item;
			} else if (!this.equipment.ring2) {
				this.equipment.ring2 = item;
			} else {
				// Replace the first ring with the new one
				this.equipment.ring1 = item;
			}
		}
	}

	updatePlayer(): { x: number, y: number } {
		let cnt: boolean = false;

		if (this.x % scaledTileSize() !== 0) {
			this.x -= this.offsetX;
			cnt = true;
		}

		if (this.y % scaledTileSize() !== 0) {
			this.y -= this.offsetY;
			cnt = true;
		}

		if (cnt) {
			return { x: this.offsetX, y: this.offsetY };
		}

		if (this.AA) {
			this.attackEvents();
		}

		this.nextPosY = this.posY;

		const cameraDiff = { x: this.x, y: this.y };

		if (this.pressUp) {
			this.y -= this.moveSpeed;
		} else if (this.pressDown) {
			this.y += this.moveSpeed;
		}

		if (this.pressLeft) {
			this.direction = "left";
			this.x -= this.moveSpeed;
		} else if (this.pressRight) {
			this.direction = "right";
			this.x += this.moveSpeed;
		}

		if (cameraDiff.x - this.x < 0) {
			this.nextPosX = this.posX + 1;
		} else {
			this.nextPosX = this.posX;
		}

		if (cameraDiff.y - this.y < 0) {
			this.nextPosY = this.posY + 1;
		} else {
			this.nextPosY = this.posY;
		}

		const collision = this.collision(Mob.mobList);

		if (collision.x) {
			this.x = cameraDiff.x;
		}

		if (collision.y) {
			this.y = cameraDiff.y;
		}

		this.offsetX = cameraDiff.x = cameraDiff.x - this.x;
		this.offsetY = cameraDiff.y = cameraDiff.y - this.y;

		return cameraDiff;
	}

	selectNearestTarget(): void {
		let nearest: Mob | Player = this.target || Mob.mobList[0];
		const prevTarget: Mob | Player = nearest;
		for (const mob of Mob.mobList) {
			const dist: number = calcDistance(mob, this);
			if (dist < 430) {
				if (dist < calcDistance(nearest, this)) {
					nearest = mob;
				}
			}
		}
		if (prevTarget === nearest) {
			return;
		}
		this.target = nearest;
	}
}