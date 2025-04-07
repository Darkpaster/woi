import {useEffect, useState} from "react";
import {entityManager, player} from "../../../../core/main.ts";

export const MessageBubble = ( { msg, playerId }: { msg: string, playerId: number } ) => {
    const target = playerId === player.id ? player : entityManager.getPlayer(playerId);

    const yOffset = target?.image?.currentAnimation.heightSize

    const leftZero = () => player?.x - window.innerWidth / 2;
    const topZero = () => player?.y - window.innerHeight / 2;

    const [x, setX] = useState(target.x - leftZero());
    const [y, setY] = useState(target.y - topZero() - yOffset);


    useEffect(() => {
        const interval = setInterval(() => {
            setX(target.x - leftZero());
            setY(target.y - topZero() - yOffset);
        }, 50);

        return () => {
            clearTimeout(interval);
        }
    }, []);

    return (
        <div className={"ui-div info-div"} style={{left: x, top: y, transform: "translateX(-50%)"}}>
            {msg}
        </div>
    )
}