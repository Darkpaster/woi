import { createAsyncThunk } from '@reduxjs/toolkit';
import {RootState} from "@reduxjs/toolkit/query";
import {
    setError,
    setLoading,
    setPlayerData,
    setRegion,
    updateMana,
    updatePosition,
    updateStamina
} from "./playerSlice.ts";
import {Position} from "../../game/core/logic/education/chemistry/types.ts";

// Fetch player data
export const fetchPlayerData = createAsyncThunk(
    'player/fetchPlayerData',
    async (characterId: string, { dispatch }) => {
        try {
            dispatch(setLoading(true));
            const response = await playerApi.getCharacterData(characterId);
            dispatch(setPlayerData(response));
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch player data';
            dispatch(setError(errorMessage));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Move player
export const movePlayer = createAsyncThunk(
    'player/movePlayer',
    async (position: Position, { dispatch, getState }) => {
        const state = getState() as RootState;
        const playerId = state.player.id;

        try {
            // Send move command to server via websocket
            websocketService.send({
                type: 'PLAYER_MOVE',
                payload: {
                    playerId,
                    position
                }
            });

            // Optimistically update position in local state
            dispatch(updatePosition(position));

            // Check if we crossed into a new region
            const currentRegion = state.world.currentRegionId;
            const newRegion = state.world.regions[currentRegion]?.connectedRegions.find(region =>
                isPositionInRegion(position, state.world.regions[region])
            );

            if (newRegion && newRegion !== currentRegion) {
                dispatch(setRegion(newRegion));

                // Notify server about region change
                websocketService.send({
                    type: 'REGION_CHANGE',
                    payload: {
                        playerId,
                        fromRegion: currentRegion,
                        toRegion: newRegion
                    }
                });
            }

            return position;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to move player';
            dispatch(setError(errorMessage));
            throw error;
        }
    }
);

// Attack target
export const attackTarget = createAsyncThunk(
    'player/attackTarget',
    async (targetId: string, { dispatch, getState }) => {
        const state = getState() as RootState;
        const playerId = state.player.id;

        try {
            // Send attack command to server
            websocketService.send({
                type: 'PLAYER_ATTACK',
                payload: {
                    playerId,
                    targetId
                }
            });

            // Reduce stamina for attack (will be confirmed by server later)
            const staminaCost = 10; // This could be calculated based on weapon, skills, etc.
            dispatch(updateStamina(state.player.stamina - staminaCost));

            return targetId;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to attack target';
            dispatch(setError(errorMessage));
            throw error;
        }
    }
);

// Use skill
export const useSkill = createAsyncThunk(
    'player/useSkill',
    async ({ skillId, targetId }: { skillId: string; targetId?: string }, { dispatch, getState }) => {
        const state = getState() as RootState;
        const playerId = state.player.id;

        try {
            // Find skill in player skills
            const skill = state.player.skills.find(s => s.id === skillId);
            if (!skill) {
                throw new Error('Skill not found');
            }

            // Check if enough mana
            if (state.player.mana < skill.manaCost) {
                throw new Error('Not enough mana');
            }

            // Check if skill is on cooldown
            const now = Date.now();
            if (skill.lastUsed + skill.cooldown > now) {
                throw new Error('Skill is on cooldown');
            }

            // Send skill use command to server
            websocketService.send({
                type: 'USE_SKILL',
                payload: {
                    playerId,
                    skillId,
                    targetId
                }
            });

            // Reduce mana (will be confirmed by server response)
            dispatch(updateMana(state.player.mana - skill.manaCost));

            return { skillId, targetId };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to use skill';
            dispatch(setError(errorMessage));
            throw error;
        }
    }
);

// Helper function
const isPositionInRegion = (position: Position, region: any): boolean => {
    if (!region || !region.centerPosition || !region.radius) return false;

    const dx = position.x - region.centerPosition.x;
    const dy = position.y - region.centerPosition.y;
    const dz = position.z - region.centerPosition.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz) <= region.radius;
};