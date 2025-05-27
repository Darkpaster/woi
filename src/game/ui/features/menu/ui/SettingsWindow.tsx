// components/SettingsWindow.tsx
import React, { useState } from "react";
import Tab from "../../../shared/ui/Tab.tsx";
import { X } from "lucide-react";
import { settings } from "../../../../core/config/settings.ts";
import "../styles/shortcuts.scss";

interface SettingsWindowProps {
    onClose?: () => void;
    theme?: 'light' | 'dark';
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({
                                                           onClose,
                                                           theme = 'light'
                                                       }) => {
    const [activeCategory, setActiveCategory] = useState<string>('Основные');

    // Состояние для настроек
    const [showFPS, setShowFPS] = useState(settings.showFPS || false);
    const [maxFPS, setMaxFPS] = useState(settings.fps || 60);
    const [language, setLanguage] = useState(settings.language || 'ru');
    const [musicVolume, setMusicVolume] = useState(50);
    const [soundVolume, setSoundVolume] = useState(50);

    // Графические настройки
    const [resolution, setResolution] = useState('1920x1080');
    const [fullscreen, setFullscreen] = useState(false);
    const [vsync, setVsync] = useState(true);

    const categories = ['Основные', 'Графика', 'Звук', 'Интерфейс'];

    const handleShowFPSChange = (checked: boolean) => {
        setShowFPS(checked);
        settings.showFPS = checked;
    };

    const handleMaxFPSChange = (value: number) => {
        setMaxFPS(value);
        settings.fps = value;
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        settings.language = lang;
    };

    const windowClasses = `shortcuts-window ${theme === 'dark' ? 'shortcuts-window--dark' : ''}`;

    const renderGeneralSettings = () => (
        <div className="shortcuts-window__keybinds">
            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Показывать FPS
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <input
                        type="checkbox"
                        checked={showFPS}
                        onChange={(e) => handleShowFPSChange(e.target.checked)}
                        className="shortcuts-window__checkbox"
                    />
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Максимальный FPS
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <input
                        type="number"
                        min={1}
                        max={144}
                        value={maxFPS}
                        onChange={(e) => handleMaxFPSChange(Number(e.target.value))}
                        className="shortcuts-window__number-input"
                    />
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Язык
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="shortcuts-window__select"
                    >
                        <option value="ru">Русский</option>
                        <option value="en">Английский</option>
                        <option value="ja">Японский</option>
                        <option value="ua">Украинский</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderGraphicsSettings = () => (
        <div className="shortcuts-window__keybinds">
            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Разрешение
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="shortcuts-window__select"
                    >
                        <option value="1920x1080">1920x1080</option>
                        <option value="1680x1050">1680x1050</option>
                        <option value="1440x900">1440x900</option>
                        <option value="1366x768">1366x768</option>
                        <option value="1280x720">1280x720</option>
                    </select>
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Полноэкранный режим
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <input
                        type="checkbox"
                        checked={fullscreen}
                        onChange={(e) => setFullscreen(e.target.checked)}
                        className="shortcuts-window__checkbox"
                    />
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Вертикальная синхронизация
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <input
                        type="checkbox"
                        checked={vsync}
                        onChange={(e) => setVsync(e.target.checked)}
                        className="shortcuts-window__checkbox"
                    />
                </div>
            </div>
        </div>
    );

    const renderSoundSettings = () => (
        <div className="shortcuts-window__keybinds">
            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Громкость музыки
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <div className="shortcuts-window__slider-container">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={musicVolume}
                            onChange={(e) => setMusicVolume(Number(e.target.value))}
                            className="shortcuts-window__slider"
                        />
                        <span className="shortcuts-window__slider-value">{musicVolume}%</span>
                    </div>
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Громкость звуков
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <div className="shortcuts-window__slider-container">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={soundVolume}
                            onChange={(e) => setSoundVolume(Number(e.target.value))}
                            className="shortcuts-window__slider"
                        />
                        <span className="shortcuts-window__slider-value">{soundVolume}%</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInterfaceSettings = () => (
        <div className="shortcuts-window__keybinds">
            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Показывать подсказки
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        className="shortcuts-window__checkbox"
                    />
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Автопауза при потере фокуса
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        className="shortcuts-window__checkbox"
                    />
                </div>
            </div>

            <div className="shortcuts-window__keybind-item">
                <div className="shortcuts-window__keybind-item-action">
                    Размер интерфейса
                </div>
                <div className="shortcuts-window__keybind-item-controls">
                    <select className="shortcuts-window__select">
                        <option value="small">Маленький</option>
                        <option value="medium" selected>Средний</option>
                        <option value="large">Большой</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeCategory) {
            case 'Основные':
                return renderGeneralSettings();
            case 'Графика':
                return renderGraphicsSettings();
            case 'Звук':
                return renderSoundSettings();
            case 'Интерфейс':
                return renderInterfaceSettings();
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <div className={windowClasses+" ui-border"}>
            <div className="shortcuts-window__header">
                <h2 className="shortcuts-window__header-title">Настройки</h2>
                <button
                    className="shortcuts-window__header-close-btn"
                    onClick={onClose}
                >
                    <X size={16} />
                </button>
            </div>

            <div className="shortcuts-window__tabs">
                {categories.map(category => (
                    <Tab
                        key={category}
                        title={category}
                        isActive={activeCategory === category}
                        onClick={() => setActiveCategory(category)}
                    />
                ))}
            </div>

            {renderContent()}

            <div className="shortcuts-window__help-text">
                Настройки автоматически сохраняются при изменении.
            </div>
        </div>
    );
};

export default SettingsWindow;