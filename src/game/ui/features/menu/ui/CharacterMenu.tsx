// components/CharacterMenu.tsx - Refactored version with improvements
import React, { useEffect, useState, useCallback } from "react";
import Player from "../../../../core/logic/actors/player.ts";
import { camera, entityManager, init, initCamera, player } from "../../../../core/main.ts";
import UseInitAPI from "../api/initAPI.ts";
import Wanderer from "../../../../core/logic/actors/characters/wanderer.ts";
import axios from "axios";
import { SmallPotionOfHealing } from "../../../../core/logic/items/consumable/potions/smallPotionOfHealing.ts";
import LoadingScreen from "../LoadingScreen.tsx";
import { settings } from "../../../../core/config/settings.ts";
import "../styles/charMenu.scss";

type MenuMode = "select" | "create";
type CharacterType = 'wanderer' | 'knight';

interface CharacterMenuProps {
    onEnter: () => void;
    onBack: () => void;
}

interface CharacterData {
    id: number;
    name: string;
    level: number;
    health: number;
    experience: number;
    gold: number;
    x: number;
    y: number;
}

interface APIResponse {
    data: CharacterData[];
}

export const CharacterMenu: React.FC<CharacterMenuProps> = ({ onEnter, onBack }) => {
    const [mode, setMode] = useState<MenuMode>("select");
    const [characters, setCharacters] = useState<Player[]>([]);
    const [screenLoading, setScreenLoading] = useState(false);
    const [charType, setCharType] = useState<CharacterType>('wanderer');
    const [selected, setSelected] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const CHARACTER_TYPES = {
        wanderer: {
            name: "Странник",
            description: `По природе своей - искатель приключений. Вы никогда не откажетесь от попыток 
                         попробовать себя в чём-то новом, а слова "таинственный лес", "загадочное озеро" 
                         и "неизвестный артефакт" вызывают в вас непреодолимый трепет.`
        },
        knight: {
            name: "Рыцарь",
            description: "Храбрый воин, защитник слабых и борец за справедливость."
        }
    };

    const getRequestConfig = useCallback(() => {
        if (mode === "create") {
            return {
                url: "/createChar",
                method: "POST" as const,
                body: {
                    name: name.trim(),
                    characterType: charType,
                },
            };
        } else {
            return {
                url: "/getCharList",
                method: "GET" as const,
            };
        }
    }, [mode, name, charType]);

    const { data, error, loading } = UseInitAPI({
        ...getRequestConfig(),
        onLoad: useCallback((response: any) => {
            try {
                if (!response) {
                    throw new Error("Нет ответа от сервера");
                }

                if (mode === "select") {
                    handleCharacterListResponse(response);
                } else {
                    handleCharacterCreationResponse();
                }
            } catch (err) {
                console.error("Error processing API response:", err);
                alert(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
            }
        }, [mode]),
        deps: [refreshTrigger],
    });

    const handleCharacterListResponse = useCallback((response: CharacterData[]) => {
        const playerList: Player[] = [];

        response.forEach(char => {
            const player = new Player();
            player.name = char.name;
            player.id = char.id;
            player.level = char.level || 1;
            playerList.push(player);
        });

        setCharacters(playerList);
    }, []);

    const handleCharacterCreationResponse = useCallback(() => {
        const player = new Wanderer();
        player.name = name.trim();

        setCharacters(prev => [...prev, player]);
        setName("");
        setMode("select");

        setRefreshTrigger(prev => !prev);
    }, [name]);

    const handleCreateChar = useCallback(() => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            alert("Пожалуйста, введите имя персонажа");
            return;
        }

        if (trimmedName.length < 2) {
            alert("Имя персонажа должно содержать минимум 2 символа");
            return;
        }

        if (loading) return;

        setRefreshTrigger(prev => !prev);
    }, [name, loading]);

    const handleEnter = useCallback(async () => {
        if (!selected || loading) return;

        const target = characters.find(char => char.id === selected);
        if (!target) {
            alert("Персонаж не найден");
            return;
        }

        setScreenLoading(true);

        try {
            await init(target);

            const [itemList, mobList, playerData] = await Promise.all([
                axios.get("/item/init"),
                axios.get("/mob/init"),
                axios.get(`/player/getCharData?characterId=${target.id}`)
            ]);

            itemList.data.forEach((item: any) => {
                const newItem = new SmallPotionOfHealing([item.itemId]);
                newItem.x = item.x * settings.defaultTileScale;
                newItem.y = item.y * settings.defaultTileScale;
                entityManager.addItem(newItem);
            });

            mobList.data.forEach((mob: any) => {
                entityManager.addMob(mob);
            });

            const charData = playerData.data;
            player.HP = charData.health;
            player.HT = player.HP;
            player.name = charData.name;
            player.id = charData.id;
            player.x = charData.x;
            player.y = charData.y;
            player.experience = charData.experience;
            player.level = charData.level;
            player.gold = charData.gold;

            initCamera();

            setTimeout(() => {
                onEnter();
            }, 500);

        } catch (error) {
            console.error("Error loading game:", error);
            alert("Ошибка при загрузке игры. Попробуйте еще раз.");
            setScreenLoading(false);
        }
    }, [selected, loading, characters, onEnter]);

    const handleCharacterSelect = useCallback((characterId: number) => {
        setSelected(characterId === selected ? null : characterId);
    }, [selected]);

    const navigateCharacterType = useCallback((direction: 'prev' | 'next') => {
        const types = Object.keys(CHARACTER_TYPES) as CharacterType[];
        const currentIndex = types.indexOf(charType);

        if (direction === 'prev') {
            const newIndex = currentIndex > 0 ? currentIndex - 1 : types.length - 1;
            setCharType(types[newIndex]);
        } else {
            const newIndex = currentIndex < types.length - 1 ? currentIndex + 1 : 0;
            setCharType(types[newIndex]);
        }
    }, [charType]);

    const renderCharacterSelect = () => (
        <>
            <div className="char-list-div">
                {characters.length > 0 ? (
                    characters.map((character) => (
                        <div
                            key={`select-${character.id}`}
                            className={`character-item ${character.id === selected ? 'selected' : ''}`}
                            onClick={() => handleCharacterSelect(character.id)}
                        >
                            <h3 style={{ color: "lightblue" }}>{character.name}</h3>
                            <div>{character.level} уровень, Сокрытый Лес</div>
                        </div>
                    ))
                ) : (
                    <div className="empty-message">
                        Список персонажей пуст
                    </div>
                )}
            </div>

            <button
                disabled={selected === null || loading}
                className="ui-div menu-button"
                onClick={handleEnter}
            >
                {loading ? "Загрузка..." : "Войти"}
            </button>

            <button
                className="ui-div menu-button"
                onClick={() => setMode('create')}
                disabled={loading}
            >
                Создать персонажа
            </button>
        </>
    );

    const renderCharacterCreate = () => (
        <>
            <h1>{CHARACTER_TYPES[charType].name}</h1>

            <div className="char-preview-div">
                <button
                    className="nav-button"
                    onClick={() => navigateCharacterType('prev')}
                    aria-label="Предыдущий тип персонажа"
                >
                    ←
                </button>
                <button
                    className="nav-button"
                    onClick={() => navigateCharacterType('next')}
                    aria-label="Следующий тип персонажа"
                >
                    →
                </button>
            </div>

            <div className="char-description">
                <h3>Описание:</h3>
                <p>{CHARACTER_TYPES[charType].description}</p>
            </div>

            <div className="char-name-input">
                <h3>Имя персонажа:</h3>
                <input
                    className="ui-div"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Введите имя..."
                    maxLength={20}
                    disabled={loading}
                />
            </div>

            <button
                className="ui-div menu-button"
                onClick={handleCreateChar}
                disabled={!name.trim() || loading}
            >
                {loading ? "Создание..." : "Создать"}
            </button>

            {error && (
                <div className="error-message">
                    Ошибка: {error.toString()}
                </div>
            )}
        </>
    );

    if (screenLoading) {
        return <LoadingScreen message="Загрузка мира..." />;
    }

    return (
        <>
            <button
                className="ui-div"
                onClick={mode === "create" ? () => setMode("select") : onBack}
                aria-label="Назад"
            >
                ←
            </button>

            <div className="ui-div char-menu-div ui-border">
                {mode === "select" ? renderCharacterSelect() : renderCharacterCreate()}
            </div>
        </>
    );
};