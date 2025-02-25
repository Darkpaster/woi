import { settings } from "../../config/settings.ts";
import { FloatText } from "../../graphics/floatText.ts";
import { floatTextList } from "../../graphics/graphics.ts";
import { AnimatedImageManager } from "../../graphics/image.ts";
import { getActorTile, getTile, getWallTile } from "../../graphics/tileSprites.ts";
import { calcDistance, randomInt, scaledTileSize } from "../../../utils/math.ts";
import { TimeDelay } from "../../../utils/time.ts";
import { getCurrentLocation } from "../world/locationList.ts";
import { Player } from "./player.ts";
import {Mob} from "./mobs/mob.ts";

export class Actor {
	
	private name: string = "Unknown";
	private x: number = getCurrentLocation().floor[0].length / 2 * scaledTileSize();
	private y: number = getCurrentLocation().floor.length / 2 * scaledTileSize();
	private offsetX: number = 0;
	private offsetY: number = 0;
	private nextPosX?: number;
	private nextPosY?: number;
	private HP: number = 100;
	private HT: number = 100;
	private HR: number = 1;
	private maxDamage: number = 5;
	private minDamage: number = 2;
	private mana: number = 0;
	private maxMana: number = 0;
	private defense: number = 0;
	private magicDefense: number = 0;
	private accuracy: number = 0;
	private evasion: number = 0;
	private criticalChance: number = 0.05;
	private criticalDamage: number = 2;
	private moveSpeed: number = 2;
	public image?: AnimatedImageManager | null;
	private attackDelay: TimeDelay = new TimeDelay(2000, true);
	private attackRange: number = 1;
	public renderState: string = "idle";
	public direction: string = "down";
	public target?: Mob | Player;

	constructor() {
	}

	getPixelSpeed(): number {
		return Math.round(this.moveSpeed * settings.defaultTileScale);
	}

	getMoveSpeed(): number {
		return this.moveSpeed;
	}

	setMoveSpeed(value: number) {
		this.moveSpeed = value;
	}

	getPosX(): number {
		return Math.floor(this.x / scaledTileSize());
	}

	getPosY(): number {
		return Math.floor(this.y / scaledTileSize());
	}

	setCoordinates(x: number, y: number): { x: number, y: number } {
		const result: { x: number, y: number } = { x: this.x, y: this.y }
		this.x = x;
		this.y = y;

		result.x -= this.x
		result.y -= this.y
		return result
	}

	getName(): string {
		return this.name;
	}

	setName(value: string) {
		this.name = value;
	}

	getX(): number {
		return this.x;
	}

	setX(value: number) {
		this.x = value;
	}

	getY(): number {
		return this.y;
	}

	setY(value: number) {
		this.y = value;
	}

	getOffsetX(): number {
		return this.offsetX;
	}

	setOffsetX(value: number) {
		this.offsetX = value;
	}

	getOffsetY(): number {
		return this.offsetY;
	}

	setOffsetY(value: number) {
		this.offsetY = value;
	}

	getNextPosX(): number | undefined {
		return this.nextPosX;
	}

	setNextPosX(value: number | undefined) {
		this.nextPosX = value;
	}

	getNextPosY(): number | undefined {
		return this.nextPosY;
	}

	setNextPosY(value: number | undefined) {
		this.nextPosY = value;
	}

	getHP(): number {
		return this.HP;
	}

	setHP(value: number) {
		this.HP = value;
	}

	getHT(): number {
		return this.HT;
	}

	setHT(value: number) {
		this.HT = value;
	}

	getHR(): number {
		return this.HR;
	}

	setHR(value: number) {
		this.HR = value;
	}

	getMaxDamage(): number {
		return this.maxDamage;
	}

	setMaxDamage(value: number) {
		this.maxDamage = value;
	}

	getMinDamage(): number {
		return this.minDamage;
	}

	setMinDamage(value: number) {
		this.minDamage = value;
	}

	getMana(): number {
		return this.mana;
	}

	setMana(value: number) {
		this.mana = value;
	}

	getMaxMana(): number {
		return this.maxMana;
	}

	setMaxMana(value: number) {
		this.maxMana = value;
	}

	getDefense(): number {
		return this.defense;
	}

	setDefense(value: number) {
		this.defense = value;
	}

	getMagicDefense(): number {
		return this.magicDefense;
	}

	setMagicDefense(value: number) {
		this.magicDefense = value;
	}

	getAccuracy(): number {
		return this.accuracy;
	}

	setAccuracy(value: number) {
		this.accuracy = value;
	}

	getEvasion(): number {
		return this.evasion;
	}

	setEvasion(value: number) {
		this.evasion = value;
	}

	getCriticalChance(): number {
		return this.criticalChance;
	}

	setCriticalChance(value: number) {
		this.criticalChance = value;
	}

	getCriticalDamage(): number {
		return this.criticalDamage;

	}

	setCriticalDamage(value: number) {
		this.criticalDamage = value;
	}


	dealDamage(damage: number, source?: Actor | null): void {
		let realDamage: number = damage;
		let crit: boolean = false;

		if (source) {
			if (source.criticalChance > Math.random()) {
				realDamage *= source.criticalDamage;
				crit = true;
			}
		}
		realDamage -= this.defense;

		if (realDamage < 0) {
			realDamage = 0;
		}

		this.HP -= realDamage;
		floatTextList.push(new FloatText({text: realDamage, x: this.x, y: this.y, color: this instanceof Player ? "red" : "orange", crit: crit}));
	}

	heal(value: number): void {
		const realValue: number = Math.min(value, this.HT - this.HP);
		this.HP += realValue;
		floatTextList.push(new FloatText({text: value, x: this.x, y: this.y, color: "green", crit: false}));
	}

	autoAttack(): void {
		if (this.attackDelay.timeIsUp()) {
			this.target?.dealDamage(randomInt(this.minDamage, this.maxDamage), this);
		}
	}

	inRangeOfAttack(): boolean {
		return calcDistance(this.target!, this) < scaledTileSize() * this.attackRange * 1.5;
	}

	attackEvents(): boolean {
		if (this.target == null) {
			return false
		}

		if (this.inRangeOfAttack()) {
			this.autoAttack();
			return true
		}

		return false
	}

	getPosTile(): any {
		return getActorTile(this);
	}

	collision(mobs: Array<Actor>): { x: boolean, y: boolean } {
		const stop: { x: boolean, y: boolean } = { x: false, y: false };

		if (!getWallTile(this.nextPosX!, this.nextPosY!).props.isWalkable) {
			stop.x = stop.y = true;
		}

		return stop
	}
}