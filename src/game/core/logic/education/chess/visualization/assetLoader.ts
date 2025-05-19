export class AssetLoader {
    private static instance: AssetLoader;
    private assets: Map<string, HTMLImageElement>;
    private loading: boolean;
    private onCompleteCallback: (() => void) | null;

    private constructor() {
        this.assets = new Map<string, HTMLImageElement>();
        this.loading = false;
        this.onCompleteCallback = null;
    }

    static getInstance(): AssetLoader {
        if (!AssetLoader.instance) {
            AssetLoader.instance = new AssetLoader();
        }
        return AssetLoader.instance;
    }

    loadAssets(assetsToLoad: { [key: string]: string }, onComplete: () => void): void {
        this.loading = true;
        this.onCompleteCallback = onComplete;

        let loadedCount = 0;
        const totalAssets = Object.keys(assetsToLoad).length;

        for (const [key, src] of Object.entries(assetsToLoad)) {
            const img = new Image();
            img.src = src;

            img.onload = () => {
                this.assets.set(key, img);
                loadedCount++;

                if (loadedCount === totalAssets) {
                    this.loading = false;
                    if (this.onCompleteCallback) {
                        this.onCompleteCallback();
                    }
                }
            };

            img.onerror = (error) => {
                console.error(`Failed to load asset: ${key}`, error);
                loadedCount++;

                if (loadedCount === totalAssets) {
                    this.loading = false;
                    if (this.onCompleteCallback) {
                        this.onCompleteCallback();
                    }
                }
            };
        }
    }

    getAsset(key: string): HTMLImageElement | undefined {
        return this.assets.get(key);
    }

    isLoading(): boolean {
        return this.loading;
    }
}