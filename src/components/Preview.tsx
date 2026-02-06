import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

interface PreviewProps {
    content: string;
}

const markdownStyles = {
    body: {
        color: colors.textPrimary,
        fontSize: typography.body.fontSize,
        lineHeight: typography.body.lineHeight * 1.5,
    },
    heading1: {
        color: colors.primary,
        fontSize: 28,
        fontWeight: '700' as const,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: spacing.sm,
    },
    heading2: {
        color: colors.primaryLight,
        fontSize: 24,
        fontWeight: '600' as const,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    heading3: {
        color: colors.accent,
        fontSize: 20,
        fontWeight: '600' as const,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    heading4: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600' as const,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    heading5: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '600' as const,
        marginTop: spacing.sm,
    },
    heading6: {
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '600' as const,
        marginTop: spacing.sm,
    },
    paragraph: {
        marginVertical: spacing.sm,
    },
    strong: {
        fontWeight: '700' as const,
        color: colors.accentOrange,
    },
    em: {
        fontStyle: 'italic' as const,
        color: colors.accentPink,
    },
    blockquote: {
        backgroundColor: colors.surfaceLight,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        paddingLeft: spacing.md,
        paddingVertical: spacing.sm,
        marginVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    code_inline: {
        backgroundColor: colors.surfaceLight,
        color: colors.accentGreen,
        fontFamily: 'monospace',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    code_block: {
        backgroundColor: colors.surfaceLight,
        color: colors.accentGreen,
        fontFamily: 'monospace',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    fence: {
        backgroundColor: colors.surfaceLight,
        color: colors.accentGreen,
        fontFamily: 'monospace',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    list_item: {
        marginVertical: spacing.xs,
    },
    bullet_list: {
        marginVertical: spacing.sm,
    },
    ordered_list: {
        marginVertical: spacing.sm,
    },
    bullet_list_icon: {
        color: colors.accent,
        marginRight: spacing.sm,
    },
    ordered_list_icon: {
        color: colors.accent,
        marginRight: spacing.sm,
    },
    hr: {
        backgroundColor: colors.border,
        height: 2,
        marginVertical: spacing.lg,
    },
    link: {
        color: colors.accent,
        textDecorationLine: 'underline' as const,
    },
    table: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        marginVertical: spacing.sm,
    },
    tr: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    th: {
        backgroundColor: colors.surfaceLight,
        padding: spacing.sm,
        fontWeight: '600' as const,
    },
    td: {
        padding: spacing.sm,
    },
};

export const Preview: React.FC<PreviewProps> = ({ content }) => {
    if (!content.trim()) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    プレビューするコンテンツがありません
                </Text>
                <Text style={styles.emptyHint}>
                    編集タブでマークダウンを入力してください
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Markdown style={markdownStyles}>{content}</Markdown>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: typography.body.fontSize,
        textAlign: 'center',
    },
    emptyHint: {
        color: colors.textMuted,
        fontSize: typography.caption.fontSize,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
});
