interface IconProps {
    icon?: string;
    count?: number;
    borderColor?: string;
    displayText?: string;
    fontSize?: string;
    textAlign?: string;
}

const Icon: React.FC<IconProps> = ({
                                                icon,
                                                count,
                                                borderColor = 'black',
                                                displayText = '',
                                                fontSize = '15px',
                                                textAlign = 'end'
                                            }) => {
    return (
        <div
            className="item-icon"
            style={{
                backgroundImage: icon ? `url(${icon})` : "",
                borderColor: borderColor,
                width: '100%',
                height: '100%',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
            }}
        >
            {displayText && (
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: textAlign as any,
                    fontSize,
                    bottom: '2px',
                    right: '2px'
                }}>
                    {displayText}
                </div>
            )}
            {count && count > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    color: 'white',
                    padding: '0 2px',
                    borderRadius: '2px',
                    fontSize: '12px'
                }}>
                    {count}
                </div>
            )}
        </div>
    );
};

export default Icon;