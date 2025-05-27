
// Компонент участника группы
import React from "react";
import {MiniStatusBar} from "./MiniStatBar.tsx";
import {PartyMember} from "./PartyWidget.tsx";

interface PartyMemberItemProps {
    member: PartyMember;
    onClick: (member: PartyMember) => void;
}

export const PartyMemberItem: React.FC<PartyMemberItemProps> = ({ member, onClick }) => {
    const isLowHealth = member.HP < member.HT * 0.3;
    const isLowMana = member.MP < member.MT * 0.25;

    return (
        <div
            className={`party-member ${!member.isOnline ? 'offline' : ''} ${isLowHealth ? 'low-health' : ''}`}
            onClick={() => onClick(member)}
        >
            {/* Левая часть - аватар и уровень */}
            <div className="party-member-avatar">
                <div className="mini-avatar" style={{backgroundImage: `url(${member.avatar})`}}>
                    {member.isLeader && <div className="leader-crown">👑</div>}
                    <div className="mini-level">{member.level}</div>
                </div>
            </div>

            {/* Правая часть - информация и шкалы */}
            <div className="party-member-info">
                <div className="party-member-header">
          <span className="party-member-name">
            {member.name}
          </span>
                    {!member.isOnline && <span className="offline-indicator">●</span>}
                    {isLowHealth && <span className="danger-indicator">⚠</span>}
                </div>

                <div className="party-member-bars">
                    <MiniStatusBar value={member.HP} max={member.HT} color="health" />
                    <MiniStatusBar value={member.MP} max={member.MT} color="mana" />
                    <MiniStatusBar value={member.SP} max={member.ST} color="stamina" />
                </div>

                {/*<div className="party-member-values">*/}
                    {/*<span className="hp-text">{member.HP}</span>*/}
                    {/*<span className="mp-text">{member.MP}</span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};
