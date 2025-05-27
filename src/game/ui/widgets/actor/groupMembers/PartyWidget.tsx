import React, { useState } from 'react';
import {PartyMemberItem} from "./PartyMemberItem.tsx";
import "./partyWidget.scss"
import {player} from "../../../../core/main.ts";

// Интерфейс для участника группы
export interface PartyMember {
    id: string;
    name: string;
    level: number;
    characterClass: string;
    HP: number;
    HT: number;
    MP: number;
    MT: number;
    SP: number;
    ST: number;
    avatar?: string;
    isOnline: boolean;
    isLeader?: boolean;
}

// Мок-данные участников группы
const mockPartyMembers: PartyMember[] = [
    {
        id: "1",
        name: "Admin",
        level: 1,
        characterClass: "воин",
        HP: player?.HP,
        HT: player?.HT,
        MP: 99999,
        MT: 99999,
        SP: 99999,
        ST: 99999,
        isOnline: true,
        isLeader: true,
        avatar: player?.icon
    },
    {
        id: "2",
        name: "Хайкмунд",
        level: 99,
        characterClass: "воин",
        HP: 999999,
        HT: 999999,
        MP: 0,
        MT: 0,
        SP: 999999,
        ST: 999999,
        isOnline: true
    },
    {
        id: "99",
        name: "Антон",
        level: 99,
        characterClass: "паладин",
        HP: 999999,
        HT: 999999,
        MP: 750,
        MT: 800,
        SP: 999999,
        ST: 999999,
        isOnline: false
    },
    // {
    //     id: "4",
    //     name: "Целитель",
    //     level: 24,
    //     characterClass: "жрец",
    //     HP: 500,
    //     HT: 650,
    //     MP: 600,
    //     MT: 700,
    //     SP: 53,
    //     ST: 100,
    //     isOnline: false
    // }
];

// Основной компонент виджета группы
const PartyWidget: React.FC = () => {
    const [selectedMember, setSelectedMember] = useState<PartyMember | null>(null);

    const handleMemberClick = (member: PartyMember) => {
        setSelectedMember(member);
        console.log('Выбран участник группы:', member.name);
    };

    return (
        <div className="party-widget ui-div ui-border">
            <div className="party-header">
                <span className="party-title">Группа ({mockPartyMembers.length}/{5})</span>
            </div>

            <div className="party-members">
                {mockPartyMembers.map((member) => (
                    <PartyMemberItem
                        key={member.id}
                        member={member}
                        onClick={handleMemberClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default PartyWidget;
