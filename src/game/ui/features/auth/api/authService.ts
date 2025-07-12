export interface UserDTO {
    email: string;
    username: string;
    password: string;
}

export class AuthAPI {
    private baseUrl: string;

    constructor(baseUrl: string = '/auth') {
        this.baseUrl = baseUrl;
    }

    /**
     * Регистрация нового пользователя
     */
    async register(user: UserDTO): Promise<number> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Вход в систему
     */
    async login(credentials: { username: string; password: string }): Promise<number> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Login failed: ${errorText}`);
        }

        return response.json();
    }

    /**
     * Выход из системы (если есть endpoint)
     */
    async logout(): Promise<void> {
        // Этот endpoint не определен в Java коде, но обычно он нужен
        const response = await fetch(`${this.baseUrl}/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok && response.status !== 404) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    /**
     * Проверить статус аутентификации
     */
    async checkAuth(): Promise<boolean> {
        try {
            // Этот endpoint тоже не определен, но часто используется
            const response = await fetch(`${this.baseUrl}/check`, {
                method: 'GET',
                credentials: 'include',
            });

            return response.ok;
        } catch {
            return false;
        }
    }
}