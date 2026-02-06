import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { FileExplorer } from '../components/FileExplorer';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import {
    insertHeading,
    insertBold,
    insertItalic,
    insertHorizontalRule,
    insertBulletList,
    insertNumberedList,
    insertCodeBlock,
    insertQuote,
    insertLink,
    insertCheckbox,
    TextSelection,
} from '../utils/markdownHelpers';
import {
    readFileContent,
    writeFileContent,
    getRootFolderUri,
    isWeb,
    createNewFile
} from '../utils/fileHelpers';

type TabType = 'edit' | 'preview';

const SIDEBAR_WIDTH = 200;

export const EditorScreen: React.FC = () => {
    const [content, setContent] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabType>('edit');
    const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0 });
    const [rootFolderUri, setRootFolderUri] = useState<string | null>(null);
    const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [showNewFileModal, setShowNewFileModal] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const editorRef = useRef<TextInput>(null);

    // Web用: 起動時にルートフォルダを初期化
    useEffect(() => {
        if (Platform.OS === 'web') {
            initializeWebStorage();
        }
    }, []);

    const initializeWebStorage = async () => {
        try {
            const rootUri = await getRootFolderUri();
            if (rootUri) {
                setRootFolderUri(rootUri);
            }
        } catch (error) {
            console.error('Failed to initialize web storage:', error);
        }
    };

    const loadFile = useCallback(async (fileUri: string) => {
        try {
            const fileContent = await readFileContent(fileUri);
            setSelectedFileUri(fileUri);
            setContent(fileContent);
            setHasUnsavedChanges(false);
            setActiveTab('edit');
        } catch (error) {
            console.error('Error loading file:', error);
            if (Platform.OS !== 'web') {
                Alert.alert('エラー', 'ファイルを読み込めませんでした');
            }
        }
    }, []);

    const handleSelectFolder = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/plain', 'text/markdown', '*/*'],
                copyToCacheDirectory: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                const folderUri = uri.substring(0, uri.lastIndexOf('/'));
                setRootFolderUri(folderUri);
                // 選択したファイルも開く
                await loadFile(uri);
            }
        } catch (error) {
            console.error('Error selecting file:', error);
            if (Platform.OS !== 'web') {
                Alert.alert('エラー', 'ファイルを選択できませんでした');
            }
        }
    }, [loadFile]);

    const handleSelectFile = useCallback(async (fileUri: string) => {
        // 未保存の変更がある場合も、シンプルに新しいファイルを読み込む
        // （本番ではAlertで確認するが、Web では Alert が動作しないため）
        await loadFile(fileUri);
    }, [loadFile]);

    const handleCreateFile = useCallback(() => {
        setNewFileName('');
        setShowNewFileModal(true);
    }, []);

    const handleConfirmCreateFile = useCallback(async () => {
        if (!newFileName.trim() || !rootFolderUri) return;

        let filename = newFileName.trim();
        if (!filename.endsWith('.md') && !filename.endsWith('.txt')) {
            filename += '.md';
        }

        try {
            const fileUri = await createNewFile(rootFolderUri, filename, `# ${filename.replace(/\.(md|txt)$/, '')}\n\n`);
            setShowNewFileModal(false);
            setNewFileName('');
            // 作成したファイルを開く
            await loadFile(fileUri);
        } catch (error) {
            console.error('Error creating file:', error);
        }
    }, [newFileName, rootFolderUri, loadFile]);

    const handleSave = useCallback(async () => {
        if (!selectedFileUri) {
            Alert.alert('エラー', 'ファイルが選択されていません');
            return;
        }

        try {
            await writeFileContent(selectedFileUri, content);
            setHasUnsavedChanges(false);
            Alert.alert('保存完了', 'ファイルを保存しました');
        } catch (error) {
            Alert.alert('エラー', 'ファイルを保存できませんでした');
        }
    }, [selectedFileUri, content]);

    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
        setHasUnsavedChanges(true);
    }, []);

    const handleToolbarAction = useCallback((action: string) => {
        let result;

        switch (action) {
            case 'h1':
                result = insertHeading(content, selection, 1);
                break;
            case 'h2':
                result = insertHeading(content, selection, 2);
                break;
            case 'h3':
                result = insertHeading(content, selection, 3);
                break;
            case 'bold':
                result = insertBold(content, selection);
                break;
            case 'italic':
                result = insertItalic(content, selection);
                break;
            case 'hr':
                result = insertHorizontalRule(content, selection);
                break;
            case 'bullet':
                result = insertBulletList(content, selection);
                break;
            case 'numbered':
                result = insertNumberedList(content, selection);
                break;
            case 'checkbox':
                result = insertCheckbox(content, selection);
                break;
            case 'code':
                result = insertCodeBlock(content, selection);
                break;
            case 'quote':
                result = insertQuote(content, selection);
                break;
            case 'link':
                result = insertLink(content, selection);
                break;
            default:
                return;
        }

        if (result) {
            setContent(result.newText);
            setSelection(result.newSelection);
            setHasUnsavedChanges(true);
            editorRef.current?.focus();
        }
    }, [content, selection]);

    const handleSelectionChange = useCallback((newSelection: TextSelection) => {
        setSelection(newSelection);
    }, []);

    const getFileName = () => {
        if (!selectedFileUri) return '新規ファイル';
        return selectedFileUri.split('/').pop() || '新規ファイル';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <View style={styles.mainLayout}>
                {/* サイドバー */}
                {isSidebarVisible && (
                    <View style={styles.sidebar}>
                        <FileExplorer
                            rootUri={rootFolderUri}
                            selectedFileUri={selectedFileUri}
                            onSelectFile={handleSelectFile}
                            onSelectFolder={handleSelectFolder}
                            onCreateFile={handleCreateFile}
                        />
                    </View>
                )}

                {/* エディターエリア */}
                <View style={styles.editorArea}>
                    {/* ヘッダー */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                style={styles.sidebarToggle}
                                onPress={() => setIsSidebarVisible(!isSidebarVisible)}
                            >
                                <Ionicons
                                    name={isSidebarVisible ? 'chevron-back' : 'menu'}
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                            <Ionicons name="document-text" size={20} color={colors.primary} />
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                {getFileName()}
                                {hasUnsavedChanges && <Text style={styles.unsavedDot}> •</Text>}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.saveButton, !selectedFileUri && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={!selectedFileUri}
                        >
                            <Ionicons
                                name="save-outline"
                                size={20}
                                color={selectedFileUri ? colors.textPrimary : colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ツールバー */}
                    <MarkdownToolbar onAction={handleToolbarAction} />

                    {/* コンテンツエリア */}
                    <KeyboardAvoidingView
                        style={styles.contentContainer}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                    >
                        {activeTab === 'edit' ? (
                            <Editor
                                ref={editorRef}
                                value={content}
                                onChangeText={handleContentChange}
                                onSelectionChange={handleSelectionChange}
                                selection={selection}
                            />
                        ) : (
                            <Preview content={content} />
                        )}
                    </KeyboardAvoidingView>

                    {/* タブ切り替え */}
                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'edit' && styles.tabActive]}
                            onPress={() => setActiveTab('edit')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color={activeTab === 'edit' ? colors.primary : colors.textMuted}
                            />
                            <Text style={[styles.tabText, activeTab === 'edit' && styles.tabTextActive]}>
                                編集
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'preview' && styles.tabActive]}
                            onPress={() => setActiveTab('preview')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="eye-outline"
                                size={20}
                                color={activeTab === 'preview' ? colors.primary : colors.textMuted}
                            />
                            <Text style={[styles.tabText, activeTab === 'preview' && styles.tabTextActive]}>
                                プレビュー
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* 新規ファイル作成モーダル */}
            <Modal
                visible={showNewFileModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNewFileModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>新規ファイル作成</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="ファイル名（例: memo.md）"
                            placeholderTextColor={colors.textMuted}
                            value={newFileName}
                            onChangeText={setNewFileName}
                            autoFocus={true}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowNewFileModal(false)}
                            >
                                <Text style={styles.modalCancelText}>キャンセル</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCreateButton}
                                onPress={handleConfirmCreateFile}
                            >
                                <Text style={styles.modalCreateText}>作成</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    mainLayout: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
    },
    editorArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.xs,
    },
    sidebarToggle: {
        padding: spacing.xs,
        marginRight: spacing.xs,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: typography.body.fontSize,
        fontWeight: '600',
        flex: 1,
    },
    unsavedDot: {
        color: colors.accentOrange,
        fontWeight: '700',
    },
    saveButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    contentContainer: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? spacing.sm : 0,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        gap: spacing.xs,
    },
    tabActive: {
        borderTopWidth: 2,
        borderTopColor: colors.primary,
        backgroundColor: colors.surfaceLight,
    },
    tabText: {
        color: colors.textMuted,
        fontSize: typography.caption.fontSize,
        fontWeight: '500',
    },
    tabTextActive: {
        color: colors.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        color: colors.textPrimary,
        fontSize: typography.h3.fontSize,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    modalInput: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.textPrimary,
        fontSize: typography.body.fontSize,
        marginBottom: spacing.md,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
    },
    modalCancelButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    modalCancelText: {
        color: colors.textMuted,
        fontSize: typography.body.fontSize,
    },
    modalCreateButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    modalCreateText: {
        color: colors.textPrimary,
        fontSize: typography.body.fontSize,
        fontWeight: '500',
    },
});
