import {Directory} from "./directory.ts";
import {FSNode} from "./fsNode.ts";

export class FileSystem {
    private root: Directory;
    private currentDirectory: Directory;

    constructor() {
        this.root = new Directory("root", null);
        this.currentDirectory = this.root;
    }

    public getRoot(): Directory {
        return this.root;
    }

    public getCurrentDirectory(): Directory {
        return this.currentDirectory;
    }

    public changeDirectory(path: string): boolean {
        const target = this.resolvePath(path);

        if (target && target instanceof Directory) {
            this.currentDirectory = target;
            return true;
        }

        return false;
    }

    public createFile(name: string, content: string): File | null {
        if (this.currentDirectory.getChild(name)) {
            return null; // File or directory already exists
        }

        const file = new File(name, this.currentDirectory);
        file.setContent(content);
        this.currentDirectory.addChild(file);
        return file;
    }

    public createDirectory(name: string): Directory | null {
        if (this.currentDirectory.getChild(name)) {
            return null; // File or directory already exists
        }

        const directory = new Directory(name, this.currentDirectory);
        this.currentDirectory.addChild(directory);
        return directory;
    }

    public resolvePath(path: string): FSNode | null {
        if (path === "/") {
            return this.root;
        }

        let current: Directory;
        if (path.startsWith("/")) {
            current = this.root;
            path = path.substring(1);
        } else {
            current = this.currentDirectory;
        }

        const parts = path.split("/");

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (part === "") continue;
            if (part === ".") continue;
            if (part === "..") {
                current = current.getParent() || this.root;
                continue;
            }

            const child = current.getChild(part);
            if (!child) {
                return null; // Path not found
            }

            if (i === parts.length - 1) {
                return child;
            }

            if (!(child instanceof Directory)) {
                return null; // Not a directory
            }

            current = child as Directory;
        }

        return current;
    }
}