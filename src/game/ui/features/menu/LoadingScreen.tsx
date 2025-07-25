// components/LoadingScreen.tsx
import React from "react";
import "./styles/loading.scss";

interface LoadingScreenProps {
    message?: string;
    className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
                                                         message = "Загрузка...",
                                                         className = ""
                                                     }) => {
    return (
        <div className={`loading-screen ${className}`} id="loading-div">
            <div className="loading-content">
                <div className="loading-spinner" aria-hidden="true">
                    <div className="spinner-ring"></div>
                </div>
                <h1 className="loading-message" role="status" aria-live="polite">
                    {message}
                </h1>
            </div>
        </div>
    );
};

export default LoadingScreen;