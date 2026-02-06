/**
 * ファイル操作ヘルパー関数
 */
import * as FileSystem from 'expo-file-system';

// 対応するテキストファイル拡張子
export const TEXT_FILE_EXTENSIONS = ['.md', '.txt', '.markdown', '.text'];

export interface FileInfo {
    name: string;
    uri: string;
    isDirectory: boolean;
    size?: number;
    modificationTime?: number;
}

/**
 * ファイルがテキストファイルかどうか判定
 */
export function isTextFile(filename: string): boolean {
    const lowerName = filename.toLowerCase();
    return TEXT_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext));
}

/**
 * ディレクトリ内のファイル一覧を取得
 */
export async function getDirectoryContents(directoryUri: string): Promise<FileInfo[]> {
    try {
        const items = await FileSystem.readDirectoryAsync(directoryUri);

        const fileInfos: FileInfo[] = await Promise.all(
            items.map(async (name) => {
                const uri = `${directoryUri}/${name}`;
                const info = await FileSystem.getInfoAsync(uri);

                return {
                    name,
                    uri,
                    isDirectory: info.isDirectory || false,
                    size: info.isDirectory ? undefined : info.size,
                    modificationTime: info.modificationTime,
                };
            })
        );

        // フォルダ優先でソート、テキストファイルのみフィルタ
        return fileInfos
            .filter(item => item.isDirectory || isTextFile(item.name))
            .sort((a, b) => {
                // フォルダを先に
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                // 名前順
                return a.name.localeCompare(b.name);
            });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

/**
 * ファイルの内容を読み込む
 */
export async function readFileContent(fileUri: string): Promise<string> {
    try {
        const content = await FileSystem.readAsStringAsync(fileUri);
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('ファイルを読み込めませんでした');
    }
}

/**
 * ファイルに内容を保存
 */
export async function writeFileContent(fileUri: string, content: string): Promise<void> {
    try {
        await FileSystem.writeAsStringAsync(fileUri, content);
    } catch (error) {
        console.error('Error writing file:', error);
        throw new Error('ファイルを保存できませんでした');
    }
}

/**
 * 新規ファイルを作成
 */
export async function createNewFile(
    directoryUri: string,
    filename: string,
    content: string = ''
): Promise<string> {
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
