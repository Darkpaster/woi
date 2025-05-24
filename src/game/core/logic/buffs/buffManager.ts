// Менеджер для управления коллекцией баффов
import {Buff, BuffData, BuffEffect, BuffType} from "./buff.ts";

export class BuffManager {
    private buffs: Map<string, Buff> = new Map();

    // Добавление или обновление баффа
    public addOrUpdateBuff(buffData: BuffData): void {
        const existingBuff = this.buffs.get(buffData.id);

        if (existingBuff && existingBuff.canStack()) {
            // Обновляем стаки для существующего баффа
            existingBuff.updateStackCount(buffData.stackCount || 1);
        } else {
            // Создаем новый бафф
            this.buffs.set(buffData.id, new Buff(buffData));
        }
    }

    // Удаление баффа
    public removeBuff(buffId: string): boolean {
        return this.buffs.delete(buffId);
    }

    // Получение баффа по ID
    public getBuff(buffId: string): Buff | undefined {
        return this.buffs.get(buffId);
    }

    // Получение всех активных баффов
    public getActiveBuffs(): Buff[] {
        return Array.from(this.buffs.values()).filter(buff => buff.isActive);
    }

    // Получение баффов по типу
    public getBuffsByType(type: BuffType): Buff[] {
        return this.getActiveBuffs().filter(buff => buff.type === type);
    }

    // Получение баффов по эффекту
    public getBuffsByEffect(effect: BuffEffect): Buff[] {
        return this.getActiveBuffs().filter(buff => buff.effect === effect);
    }

    // Очистка истекших баффов
    public cleanupExpiredBuffs(): void {
        for (const [id, buff] of this.buffs) {
            if (buff.isExpired()) {
                this.buffs.delete(id);
            }
        }
    }

    // Получение количества активных баффов
    public getActiveBuffCount(): number {
        return this.getActiveBuffs().length;
    }

    // Очистка всех баффов
    public clear(): void {
        this.buffs.clear();
    }
}