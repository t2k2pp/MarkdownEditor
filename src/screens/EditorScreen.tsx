import React, { useState, useRef, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
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

type TabType = 'edit' | 'preview';

export const EditorScreen: React.FC = () => {
    const [content, setContent] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabType>('edit');
    const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0 });
    const editorRef = useRef<TextInput>(null);

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
            // エディターにフォーカスを戻す
            editorRef.current?.focus();
        }
    }, [content, selection]);

    const handleSelectionChange = useCallback((newSelection: TextSelection) => {
        setSelection(newSelection);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* ヘッダー */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                    <Text style={styles.headerTitle}>マークダウンエディター</Text>
                </View>
                <TouchableOpacity style={styles.saveButton}>
                    <Ionicons name="save-outline" size={22} color={colors.textPrimary} />
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
                        onChangeText={setContent}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: typography.h3.fontSize,
        fontWeight: typography.h3.fontWeight,
    },
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
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
});
