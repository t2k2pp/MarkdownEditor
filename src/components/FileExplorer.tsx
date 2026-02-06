import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { FileItem } from './FileItem';
import { FileInfo, getDirectoryContents } from '../utils/fileHelpers';

interface FileExplorerProps {
    rootUri: string | null;
    selectedFileUri: string | null;
    onSelectFile: (fileUri: string) => void;
    onSelectFolder: () => void;
    onCreateFile?: () => void;
}

interface ExpandedFolders {
    [uri: string]: boolean;
}

interface FolderContents {
    [uri: string]: FileInfo[];
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
    rootUri,
    selectedFileUri,
    onSelectFile,
    onSelectFolder,
    onCreateFile,
}) => {
    const [loading, setLoading] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<ExpandedFolders>({});
    const [folderContents, setFolderContents] = useState<FolderContents>({});

    // ルートフォルダの内容を読み込み
    useEffect(() => {
        if (rootUri) {
            loadFolderContents(rootUri);
            setExpandedFolders({ [rootUri]: true });
        }
    }, [rootUri]);

    const loadFolderContents = useCallback(async (uri: string) => {
        if (folderContents[uri]) return; // キャッシュがあればスキップ

        setLoading(true);
        try {
            const contents = await getDirectoryContents(uri);
            setFolderContents(prev => ({ ...prev, [uri]: contents }));
        } catch (error) {
            console.error('Error loading folder:', error);
        } finally {
            setLoading(false);
        }
    }, [folderContents]);

    const toggleFolder = useCallback(async (uri: string) => {
        const isExpanded = expandedFolders[uri];
        setExpandedFolders(prev => ({ ...prev, [uri]: !isExpanded }));

        if (!isExpanded && !folderContents[uri]) {
            await loadFolderContents(uri);
        }
    }, [expandedFolders, folderContents, loadFolderContents]);

    const renderFileTree = (parentUri: string, depth: number = 0): React.ReactNode => {
        const contents = folderContents[parentUri] || [];

        return contents.map((item) => (
            <View key={item.uri}>
                <FileItem
                    item={item}
                    isSelected={selectedFileUri === item.uri}
                    isExpanded={expandedFolders[item.uri]}
                    depth={depth}
                    onPress={() => onSelectFile(item.uri)}
                    onToggleExpand={() => toggleFolder(item.uri)}
                />
                {item.isDirectory && expandedFolders[item.uri] && (
                    renderFileTree(item.uri, depth + 1)
                )}
            </View>
        ));
    };

    if (!rootUri) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>フォルダが選択されていません</Text>
                <TouchableOpacity style={styles.selectButton} onPress={onSelectFolder}>
                    <Ionicons name="add" size={20} color={colors.textPrimary} />
                    <Text style={styles.selectButtonText}>フォルダを選択</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // フォルダ名を取得（Web用の仮想フォルダは特別処理）
    const getFolderDisplayName = () => {
        if (rootUri.startsWith('web://')) {
            return 'マイドキュメント';
        }
        return rootUri.split('/').pop() || 'Documents';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={onSelectFolder}>
                    <Ionicons name="folder-open" size={18} color={colors.primary} />
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {getFolderDisplayName()}
                    </Text>
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    {onCreateFile && (
                        <TouchableOpacity style={styles.actionButton} onPress={onCreateFile}>
                            <Ionicons name="add" size={18} color={colors.accentGreen} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            setFolderContents({});
                            loadFolderContents(rootUri);
                        }}
                    >
                        <Ionicons name="refresh" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.fileList} showsVerticalScrollIndicator={false}>
                {loading && Object.keys(folderContents).length === 0 ? (
                    <ActivityIndicator color={colors.primary} style={styles.loader} />
                ) : (
                    renderFileTree(rootUri)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.xs,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: typography.caption.fontSize,
        fontWeight: '600',
        flex: 1,
    },
    refreshButton: {
        padding: spacing.xs,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    actionButton: {
        padding: spacing.xs,
    },
    fileList: {
        flex: 1,
        paddingVertical: spacing.xs,
    },
    loader: {
        marginTop: spacing.lg,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: typography.caption.fontSize,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    selectButtonText: {
        color: colors.textPrimary,
        fontSize: typography.caption.fontSize,
        fontWeight: '500',
    },
});
