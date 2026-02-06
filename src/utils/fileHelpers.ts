/**
 * クロスプラットフォーム対応のストレージヘルパー
 * - iOS/Android: expo-file-systemを使用
 * - Web: AsyncStorageを使用（仮想ファイルシステム）
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// ストレージキーのプレフィックス
const STORAGE_PREFIX = '@markdown_editor:';
const FILES_KEY = `${STORAGE_PREFIX}files`;
const FOLDERS_KEY = `${STORAGE_PREFIX}folders`;

// 対応するテキストファイル拡張子
export const TEXT_FILE_EXTENSIONS = ['.md', '.txt', '.markdown', '.text'];

export interface FileInfo {
    name: string;
    uri: string;
    isDirectory: boolean;
    size?: number;
    modificationTime?: number;
}

interface StoredFile {
    name: string;
    content: string;
    folderId: string;
    createdAt: number;
    modifiedAt: number;
}

interface StoredFolder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: number;
}

/**
 * ファイルがテキストファイルかどうか判定
 */
export function isTextFile(filename: string): boolean {
    const lowerName = filename.toLowerCase();
    return TEXT_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext));
}

/**
 * Web用の仮想ファイルシステム管理クラス
 */
class WebStorageManager {
    private files: Map<string, StoredFile> = new Map();
    private folders: Map<string, StoredFolder> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const filesJson = await AsyncStorage.getItem(FILES_KEY);
            const foldersJson = await AsyncStorage.getItem(FOLDERS_KEY);

            if (filesJson) {
                const filesArray: [string, StoredFile][] = JSON.parse(filesJson);
                this.files = new Map(filesArray);
            }

            if (foldersJson) {
                const foldersArray: [string, StoredFolder][] = JSON.parse(foldersJson);
                this.folders = new Map(foldersArray);
            }

            // デフォルトのルートフォルダを作成
            if (!this.folders.has('root')) {
                this.folders.set('root', {
                    id: 'root',
                    name: 'マイドキュメント',
                    parentId: null,
                    createdAt: Date.now(),
                });
                await this.save();
            }

            this.initialized = true;
        } catch (error) {
            console.error('WebStorageManager init error:', error);
        }
    }

    private async save(): Promise<void> {
        try {
            await AsyncStorage.setItem(FILES_KEY, JSON.stringify([...this.files]));
            await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify([...this.folders]));
        } catch (error) {
            console.error('WebStorageManager save error:', error);
        }
    }

    async getRootFolderUri(): Promise<string> {
        await this.initialize();
        return 'web://root';
    }

    async getFolders(): Promise<StoredFolder[]> {
        await this.initialize();
        return Array.from(this.folders.values());
    }

    async getDirectoryContents(folderUri: string): Promise<FileInfo[]> {
        await this.initialize();
        const folderId = folderUri.replace('web://', '');

        const subfolders = Array.from(this.folders.values())
            .filter(f => f.parentId === folderId)
            .map(f => ({
                name: f.name,
                uri: `web://${f.id}`,
                isDirectory: true,
                modificationTime: f.createdAt,
            }));

        const files = Array.from(this.files.values())
            .filter(f => f.folderId === folderId)
            .map(f => ({
                name: f.name,
                uri: `web://file/${f.name}`,
                isDirectory: false,
                size: f.content.length,
                modificationTime: f.modifiedAt,
            }));

        return [...subfolders, ...files].sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });
    }

    async readFile(fileUri: string): Promise<string> {
        await this.initialize();
        const filename = fileUri.replace('web://file/', '');
        const file = this.files.get(filename);
        if (!file) throw new Error('File not found');
        return file.content;
    }

    async writeFile(fileUri: string, content: string): Promise<void> {
        await this.initialize();
        const filename = fileUri.replace('web://file/', '');
        const existing = this.files.get(filename);

        if (existing) {
            existing.content = content;
            existing.modifiedAt = Date.now();
        } else {
            this.files.set(filename, {
                name: filename,
                content,
                folderId: 'root',
                createdAt: Date.now(),
                modifiedAt: Date.now(),
            });
        }

        await this.save();
    }

    async createFile(folderId: string, filename: string, content: string = ''): Promise<string> {
        await this.initialize();
        const fileUri = `web://file/${filename}`;

        this.files.set(filename, {
            name: filename,
            content,
            folderId,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
        });

        await this.save();
        return fileUri;
    }

    async createFolder(parentId: string, name: string): Promise<string> {
        await this.initialize();
        const id = `folder_${Date.now()}`;

        this.folders.set(id, {
            id,
            name,
            parentId,
            createdAt: Date.now(),
        });

        await this.save();
        return `web://${id}`;
    }

    async deleteFile(fileUri: string): Promise<void> {
        await this.initialize();
        const filename = fileUri.replace('web://file/', '');
        this.files.delete(filename);
        await this.save();
    }
}

// シングルトンインスタンス
const webStorage = new WebStorageManager();

/**
 * プラットフォーム共通: ルートフォルダURIを取得
 */
export async function getRootFolderUri(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return await webStorage.getRootFolderUri();
    }
    // Native: ドキュメントディレクトリを返す
    return FileSystem.documentDirectory;
}

/**
 * プラットフォーム共通: ディレクトリ内のファイル一覧を取得
 */
export async function getDirectoryContents(directoryUri: string): Promise<FileInfo[]> {
    if (Platform.OS === 'web') {
        return await webStorage.getDirectoryContents(directoryUri);
    }

    // Native: expo-file-systemを使用
    try {
        const items = await FileSystem.readDirectoryAsync(directoryUri);

        const fileInfos: FileInfo[] = await Promise.all(
            items.map(async (name) => {
                const uri = `${directoryUri}/${name}`;
                const info = await FileSystem.getInfoAsync(uri);

                return {
                    name,
                    uri,
                    isDirectory: info.exists ? (info.isDirectory || false) : false,
                    size: info.exists && !info.isDirectory ? (info as any).size : undefined,
                    modificationTime: info.exists ? (info as any).modificationTime : undefined,
                };
            })
        );

        return fileInfos
            .filter(item => item.isDirectory || isTextFile(item.name))
            .sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

/**
 * プラットフォーム共通: ファイルの内容を読み込む
 */
export async function readFileContent(fileUri: string): Promise<string> {
    if (Platform.OS === 'web') {
        return await webStorage.readFile(fileUri);
    }

    try {
        const content = await FileSystem.readAsStringAsync(fileUri);
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('ファイルを読み込めませんでした');
    }
}

/**
 * プラットフォーム共通: ファイルに内容を保存
 */
export async function writeFileContent(fileUri: string, content: string): Promise<void> {
    if (Platform.OS === 'web') {
        await webStorage.writeFile(fileUri, content);
        return;
    }

    try {
        await FileSystem.writeAsStringAsync(fileUri, content);
    } catch (error) {
        console.error('Error writing file:', error);
        throw new Error('ファイルを保存できませんでした');
    }
}

/**
 * プラットフォーム共通: 新規ファイルを作成
 */
export async function createNewFile(
    directoryUri: string,
    filename: string,
    content: string = ''
): Promise<string> {
    if (Platform.OS === 'web') {
        const folderId = directoryUri.replace('web://', '');
        return await webStorage.createFile(folderId, filename, content);
    }

    const fileUri = `${directoryUri}/${filename}`;
    await writeFileContent(fileUri, content);
    return fileUri;
}

/**
 * ファイル名から拡張子を取得
 */
export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot).toLowerCase();
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number | undefined): string {
    if (bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Webかどうか判定
 */
export function isWeb(): boolean {
    return Platform.OS === 'web';
}
