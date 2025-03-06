import { FloatText } from "../../graphics/floatText.ts";
import { AnimatedImageManager } from "../../graphics/image.ts";
import { calcDistance, randomInt, scaledTileSize } from "../../../utils/math.ts";
import { TimeDelay } from "../../../utils/time.ts";
import {Mob} from "./mobs/mob.ts";
import {Skill} from "../skills/skill.ts";
import {graphics} from "../../main.ts";
import {settings} from "../../config/settings.ts";

import {v4 as uuidv4} from "uuid"

export interface EntityUIInfo {
	id: string;
	name: string;
	image?: AnimatedImageManager | null;
	icon?: string | null;
	description: string;
	note?: string;
	rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike";
}

export class Actor implements EntityUIInfo {
	get id(): string {
		return this._id;
	}

	set id(value: string) {
		this._id = value;
	}
	get icon(): string | null | undefined {
		return this._sprite;
	}

	set icon(value: string | null ) {
		this._sprite = value;
	}
	get spellBook(): Array<Skill | null> {
		return this._spellBook;
	}

	set spellBook(value: Array<Skill | null>) {
		this._spellBook = value;
	}
	get posY(): number {
		return Math.floor(this._y / scaledTileSize())
	}

	get posX(): number {
		return Math.floor(this._x / scaledTileSize())
	}

	public get y(): number {
		return this._y;
	}

	public set y(value: number) {
		this._y = value;
	}
	public get x(): number {
		return this._x;
	}

	public set x(value: number) {
		this._x = value;
	}
	public get target(): Mob | undefined | any {
		return this._target;
	}

	public set target(value: Mob | any) {
		this._target = value;
	}
	public get direction(): string {
		return this._direction;
	}

	public set direction(value: string) {
		this._direction = value;
	}
	public get renderState(): string {
		return this._renderState;
	}

	public set renderState(value: string) {
		this._renderState = value;
	}
	public get attackRange(): number {
		return this._attackRange;
	}

	public set attackRange(value: number) {
		this._attackRange = value;
	}
	public get attackDelay(): TimeDelay {
		return this._attackDelay;
	}

	public set attackDelay(value: TimeDelay) {
		this._attackDelay = value;
	}
	public get moveSpeed(): number {
		return this._moveSpeed * settings.defaultTileScale;
	}

	public set moveSpeed(value: number) {
		this._moveSpeed = value;
	}
	public get criticalDamage(): number {
		return this._criticalDamage;
	}

	public set criticalDamage(value: number) {
		this._criticalDamage = value;
	}
	public get criticalChance(): number {
		return this._criticalChance;
	}

	public set criticalChance(value: number) {
		this._criticalChance = value;
	}
	public get evasion(): number {
		return this._evasion;
	}

	public set evasion(value: number) {
		this._evasion = value;
	}
	public get accuracy(): number {
		return this._accuracy;
	}

	public set accuracy(value: number) {
		this._accuracy = value;
	}
	public get magicDefense(): number {
		return this._magicDefense;
	}

	public set magicDefense(value: number) {
		this._magicDefense = value;
	}
	public get defense(): number {
		return this._defense;
	}

	public set defense(value: number) {
		this._defense = value;
	}
	public get MT(): number {
		return this._MT;
	}

	public set MT(value: number) {
		this._MT = value;
	}
	public get MP(): number {
		return this._MP;
	}

	public set MP(value: number) {
		this._MP = value;
	}
	public get minDamage(): number {
		return this._minDamage;
	}

	public set minDamage(value: number) {
		this._minDamage = value;
	}
	public get maxDamage(): number {
		return this._maxDamage;
	}

	public set maxDamage(value: number) {
		this._maxDamage = value;
	}
	public get HR(): number {
		return this._HR;
	}

	public set HR(value: number) {
		this._HR = value;
	}
	public get HT(): number {
		return this._HT;
	}

	public set HT(value: number) {
		this._HT = value;
	}
	public get HP(): number {
		return this._HP;
	}

	public set HP(value: number) {
		this._HP = value;
	}

	public get offsetY(): number {
		return this._offsetY;
	}

	public set offsetY(value: number) {
		this._offsetY = value;
	}
	public get offsetX(): number {
		return this._offsetX;
	}

	public set offsetX(value: number) {
		this._offsetX = value;
	}

	public get image(): AnimatedImageManager | null | undefined {
		return this._image;
	}

	public set image(value: AnimatedImageManager | null) {
		this._image = value;
	}
	public get note(): string | undefined {
		return this._note;
	}

	public set note(value: string) {
		this._note = value;
	}
	public get rarity(): "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" {
		return this._rarity;
	}

	public set rarity(value: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike") {
		this._rarity = value;
	}
	public get description(): string {
		return this._description;
	}

	public set description(value: string) {
		this._description = value;
	}
	public get name(): string {
		return this._name;
	}

	public set name(value: string) {
		this._name = value;
	}

	private _name: string = "???";
	private _id: string = uuidv4();
	private _image?: AnimatedImageManager | null;
	private _sprite?: string | null;
	private _description: string = "Unknown creature";
	private _note?: string;
	private _rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "godlike" = "common";
	
	private _x: number = 0;
	private _y: number = 0;
	// private readonly posX: number = Math.floor(this._x / scaledTileSize());
	// private readonly posY: number = Math.floor(this._y / scaledTileSize());
	private _offsetX: number = 0;
	private _offsetY: number = 0;
	private _HP: number = 100;
	private _HT: number = 100;
	private _HR: number = 1;
	private _maxDamage: number = 5;
	private _minDamage: number = 2;
	private _MP: number = 0;
	private _MT: number = 0;
	private _defense: number = 0;
	private _magicDefense: number = 0;
	private _accuracy: number = 0;
	private _evasion: number = 0;
	private _criticalChance: number = 0.05;
	private _criticalDamage: number = 2;
	private _moveSpeed: number = 2;
	private _attackDelay: TimeDelay = new TimeDelay(2000, true);
	private _attackRange: number = 1;
	private _renderState: string = "idle";
	private _direction: string = "down";

	private _target?: Mob | any;

	private _spellBook: Array<Skill | null> = [];

	public setCoordinates(x: number, y: number) {
		const result = { x: this.x, y: this.y }
		this.x = x;
		this.y = y;
		result.x -= this.x;
		result.y -= this.y;
		return result
	}

	autoAttack(): void {
		if (this._attackDelay.timeIsUp()) {
			this.target!.dealDamage(randomInt(this._minDamage, this._maxDamage), this);
		}
	}

	dealDamage(damage: number, source?: Actor | null): void {
		let realDamage: number = damage;
		let crit: boolean = false;

		if (source) {
			if (source._criticalChance > Math.random()) {
				realDamage *= source._criticalDamage;
				crit = true;
			}
		}
		realDamage -= this._defense;

		if (realDamage < 0) {
			realDamage = 0;
		}

		this._HP -= realDamage;
		graphics?.floatTextList.push(new FloatText({text: realDamage, x: this._x, y: this._y, color: this instanceof Mob ? "orange" : "red", crit: crit}));
	}

	learn<T extends Skill>(spell: T): void {
		this._spellBook.push(spell);
	}

	heal(value: number): void {
		const realValue: number = Math.min(value, this._HT - this._HP);
		this._HP += realValue;
		graphics?.floatTextList.push(new FloatText({text: value, x: this._x, y: this._y, color: "green", crit: false}));
	}

	inRangeOfAttack(): boolean {
		return calcDistance(this.target!, this) < scaledTileSize() * this._attackRange * 1.5;
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

	// getPosTile(): any {
	// 	return getActorTile(this);
	// }

	collision(mobs: Array<Actor>): { x: boolean, y: boolean } {
		const stop: { x: boolean, y: boolean } = { x: false, y: false };

		// if () {
		// 	stop.x = stop.y = true;
		// }
		// if ()

		return stop
	}
}