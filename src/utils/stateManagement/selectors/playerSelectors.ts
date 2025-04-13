// src/store/selectors/playerSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import {RootState} from "@reduxjs/toolkit/query";

// Basic selectors
export const selectPlayerId = (state: RootState) => state.player.id;
export const selectPlayerPosition = (state: RootState) => state.player.position;
export const selectPlayerStats = (state: RootState) => state.player.stats;
export const selectPlayerHealth = (state: RootState) => state.player.health;
export const selectPlayerMaxHealth = (state: RootState) => state.player.maxHealth;
export const selectPlayerMana = (state: RootState) => state.player.mana;
export const selectPlayerMaxMana = (state: RootState) => state.player.maxMana;
export const selectPlayerLevel = (state: RootState) => state.player.level;
export const selectPlayerExperience = (state: RootState) => state.player.experience;
export const selectPlayerEquipment = (state: RootState) => state.player.equipment;
export const selectPlayerActiveEffects = (state: RootState) => state.player.activeEffects;
export const selectPlayerIsInCombat = (state: RootState) => state.player.isInCombat;
export const selectPlayerRegionId = (state: RootState) => state.player.regionId;
export const selectPlayerGold = (state: RootState) => state.player.gold;

// Computed selectors
export const selectPlayerHealthPercentage = createSelector(
    [selectPlayerHealth, selectPlayerMaxHealth],
    (health, maxHealth) => (maxHealth > 0 ? (health / maxHealth) * 100 : 0)
);

export const selectPlayerManaPercentage = createSelector(
    [selectPlayerMana, selectPlayerMaxMana],
    (mana, maxMana) => (maxMana > 0 ? (mana / maxMana) * 100 : 0)
);

export const selectPlayerExperiencePercentage = createSelector(
    [selectPlayerExperience, (state: RootState) => state.player.experienceToNextLevel],
    (experience, experienceToNextLevel) =>
        (experienceToNextLevel > 0 ? (experience / experienceToNextLevel) * 100 : 0)
);

export const selectPlayerTotalAttack = createSelector(
    [selectPlayerStats, selectPlayerEquipment],
    (stats, equipment) => {
        let totalAttack = stats.physicalAttack;

        // Add equipment bonuses
        Object.values(equipment).forEach(item => {
            if (item && item.attributes && item.attributes.physicalAttack) {
                totalAttack += item.attributes.physicalAttack;
            }
        });

        return totalAttack;
    }
);

export const selectPlayerTotalDefense = createSelector(
    [selectPlayerStats, selectPlayerEquipment],
    (stats, equipment) => {
        let totalDefense = stats.physicalDefense;

        // Add equipment bonuses
        Object.values(equipment).forEach(item => {
            if (item && item.attributes && item.attributes.physicalDefense) {
                totalDefense += item.attributes.physicalDefense;
            }
        });

        return totalDefense;
    }
);

export const selectPlayerActiveSkills = createSelector(
    [(state: RootState) => state.player.skills],
    (skills) => skills.filter(skill => skill.level > 0)
);

export const selectPlayerCanLevelUpSkills = createSelector(
    [(state: RootState) => state.player.skillPoints],
    (skillPoints) => skillPoints > 0
);

export const selectPlayerTarget = createSelector(
    [
        (state: RootState) => state.player.targetId,
        (state: RootState) => state.world.visiblePlayers,
        (state: RootState) => state.world.monsters,
        (state: RootState) => state.world.npcs
    ],
    (targetId, players, monsters, npcs) => {
        if (!targetId) return null;

        // Check if target is a player
        if (players[targetId]) {
            return {
                type: 'player',
                data: players[targetId]
            };
        }

        // Check if target is a monster
        if (monsters[targetId]) {
            return {
                type: 'monster',
                data: monsters[targetId]
            };
        }

        // Check if target is an NPC
        if (npcs[targetId]) {
            return {
                type: 'npc',
                data: npcs[targetId]
            };
        }

        return null;
    }
);

// Performance-optimized selector for character status display
export const selectPlayerStatusInfo = createSelector(
    [
        selectPlayerHealth,
        selectPlayerMaxHealth,
        selectPlayerMana,
        selectPlayerMaxMana,
        selectPlayerLevel,
        selectPlayerExperience,
        (state: RootState) => state.player.experienceToNextLevel,
        selectPlayerActiveEffects
    ],
    (health, maxHealth, mana, maxMana, level, experience, experienceToNextLevel, activeEffects) => ({
        health,
        maxHealth,
        healthPercentage: (maxHealth > 0 ? (health / maxHealth) * 100 : 0),
        mana,
        maxMana,
        manaPercentage: (maxMana > 0 ? (mana / maxMana) * 100 : 0),
        level,
        experience,
        experienceToNextLevel,
        experiencePercentage: (experienceToNextLevel > 0 ? (experience / experienceToNextLevel) * 100 : 0),
        activeEffects
    })
);