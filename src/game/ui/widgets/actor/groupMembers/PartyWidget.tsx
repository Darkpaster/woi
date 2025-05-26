import React, { useState } from 'react';
import {PartyMemberItem} from "./PartyMemberItem.tsx";
import "./partyWidget.scss"

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
    isOnline: boolean;
    isLeader?: boolean;
}

// Мок-данные участников группы
const mockPartyMembers: PartyMember[] = [
    {
        id: "1",
        name: "Артемий",
        level: 25,
        characterClass: "воин",
        HP: 850,
        HT: 1000,
        MP: 200,
        MT: 300,
        isOnline: true,
        isLeader: true
    },
    {
        id: "2",
        name: "Эльфийка",
        level: 23,
        characterClass: "лучник",
        HP: 420,
        HT: 600,
        MP: 480,
        MT: 500,
        isOnline: true
    },
    {
        id: "3",
        name: "Магистр",
        level: 27,
        characterClass: "маг",
        HP: 300,
        HT: 400,
        MP: 750,
        MT: 800,
        isOnline: true
    },
    {
        id: "4",
        name: "Целитель",
        level: 24,
        characterClass: "жрец",
        HP: 500,
        HT: 650,
        MP: 600,
        MT: 700,
        isOnline: false
    }
];

// Основной компонент виджета группы
const PartyWidget: React.FC = () => {
    const [selectedMember, setSelectedMember] = useState<PartyMember | null>(null);

    const handleMemberClick = (member: PartyMember) => {
        setSelectedMember(member);
        console.log('Выбран участник группы:', member.name);
    };

    return (
        <div className="party-widget">
            <div className="party-header">
                <span className="party-title">Группа ({mockPartyMembers.filter(m => m.isOnline).length}/{mockPartyMembers.length})</span>
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
