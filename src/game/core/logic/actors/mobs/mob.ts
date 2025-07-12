import {TimeDelay} from "../../../../../utils/general/time.ts";
import {Actor} from "../actor.ts";
import {scaledTileSize} from "../../../../../utils/math/general.ts";
import {entityManager} from "../../../main.ts";

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

    state: string;
    timer: TimeDelay;
    idle: boolean;
    private _agroRadius: number;
    public isHovered: boolean = false;
    public isTargeted: boolean = false;

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

    /**
     * Проверяет, попадает ли точка в область моба
     * @param worldX - X координата в мировых координатах
     * @param worldY - Y координата в мировых координатах
     * @param radius - радиус проверки (по умолчанию половина размера тайла)
     * @returns true если точка попадает в область моба
     */
    public isPointInside(worldX: number, worldY: number, radius: number = scaledTileSize() / 2): boolean {
        const distance = Math.sqrt(
            Math.pow(this.x - worldX, 2) + Math.pow(this.y - worldY, 2)
        );
        return distance <= radius;
    }

    /**
     * Статический метод для получения всех мобов в указанной позиции
     * @param worldX - X координата в мировых координатах
     * @param worldY - Y координата в мировых координатах
     * @param mobs - массив мобов для проверки
     * @param radius - радиус проверки
     * @returns массив мобов в указанной позиции
     */
    static getMobsOnTile(worldX: number, worldY: number, mobs?: Mob[], radius: number = scaledTileSize() / 2): Mob[] {
        if (!mobs) {
            // Если массив мобов не передан, используем глобальный entityManager
            // Предполагаем, что entityManager доступен глобально
            if (typeof entityManager !== 'undefined' && entityManager.mobs) {
                mobs = Array.from(entityManager.mobs.values());
            } else {
                return [];
            }
        }

        return mobs.filter(mob => mob.isPointInside(worldX, worldY, radius));
    }

    /**
     * Получает ближайшего моба к указанной точке из массива мобов
     * @param worldX - X координата в мировых координатах
     * @param worldY - Y координата в мировых координатах
     * @param mobs - массив мобов для проверки
     * @returns ближайший моб или null если мобов нет
     */
    static getNearestMob(worldX: number, worldY: number, mobs: Mob[]): Mob | null {
        if (mobs.length === 0) return null;

        let nearestMob = mobs[0];
        let minDistance = Math.sqrt(
            Math.pow(nearestMob.x - worldX, 2) + Math.pow(nearestMob.y - worldY, 2)
        );

        for (let i = 1; i < mobs.length; i++) {
            const mob = mobs[i];
            const distance = Math.sqrt(
                Math.pow(mob.x - worldX, 2) + Math.pow(mob.y - worldY, 2)
            );

            if (distance < minDistance) {
                nearestMob = mob;
                minDistance = distance;
            }
        }

        return nearestMob;
    }

    /**
     * Обновляет визуальное состояние моба
     * @param hoveredMob - моб, на который наведена мышь
     * @param targetedMob - моб, который выбран как цель
     */
    public updateVisualState(hoveredMob: Mob | null, targetedMob: Mob | null): void {
        this.isHovered = hoveredMob === this;
        this.isTargeted = targetedMob === this;
    }

    /**
     * Возвращает дополнительные стили для рендеринга моба
     * @returns объект со стилями для рендеринга
     */
    public getRenderStyles(): {
        outline?: boolean;
        outlineColor?: string;
        outlineWidth?: number;
        highlight?: boolean;
        highlightColor?: string;
        alpha?: number;
    } {
        const styles: any = {};

        if (this.isTargeted) {
            styles.outline = true;
            styles.outlineColor = '#ff0000'; // Красный контур для выбранной цели
            styles.outlineWidth = 2;
        } else if (this.isHovered) {
            styles.highlight = true;
            styles.highlightColor = '#ffff00'; // Желтая подсветка при наведении
            styles.alpha = 0.8;
        }

        return styles;
    }
}