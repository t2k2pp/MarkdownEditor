import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

interface ToolbarButton {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    action: string;
    color?: string;
}

interface MarkdownToolbarProps {
    onAction: (action: string) => void;
}

const toolbarButtons: ToolbarButton[] = [
    { icon: 'text', label: 'H1', action: 'h1' },
    { icon: 'text', label: 'H2', action: 'h2' },
    { icon: 'text', label: 'H3', action: 'h3' },
    { icon: 'text-outline', label: 'B', action: 'bold' },
    { icon: 'text-outline', label: 'I', action: 'italic' },
    { icon: 'remove-outline', label: '—', action: 'hr' },
    { icon: 'list', label: '•', action: 'bullet' },
    { icon: 'list', label: '1.', action: 'numbered' },
    { icon: 'checkbox-outline', label: '☐', action: 'checkbox' },
    { icon: 'code-slash', label: '</>', action: 'code' },
    { icon: 'chatbubble-outline', label: '"', action: 'quote' },
    { icon: 'link', label: '🔗', action: 'link' },
];

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onAction }) => {
    const renderButton = (button: ToolbarButton, index: number) => {
        const isHeading = button.action.startsWith('h');
        const isBold = button.action === 'bold';
        const isItalic = button.action === 'italic';

        return (
            <TouchableOpacity
                key={index}
                style={styles.button}
                onPress={() => onAction(button.action)}
                activeOpacity={0.7}
            >
                {isHeading ? (
                    <Text style={[styles.headingText, { fontSize: 20 - (parseInt(button.action[1]) * 2) }]}>
                        {button.label}
                    </Text>
                ) : isBold ? (
                    <Text style={[styles.buttonText, { fontWeight: '700' }]}>B</Text>
                ) : isItalic ? (
                    <Text style={[styles.buttonText, { fontStyle: 'italic' }]}>I</Text>
                ) : (
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={button.icon}
                            size={20}
                            color={colors.textPrimary}
                        />
                        {button.label !== button.icon && !['B', 'I'].includes(button.label) && button.label.length <= 2 && (
                            <Text style={styles.labelOverlay}>{button.label}</Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {toolbarButtons.map((button, index) => renderButton(button, index))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surfaceLight,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.sm,
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    buttonText: {
        color: colors.textPrimary,
        fontSize: 18,
    },
    headingText: {
        color: colors.primary,
        fontWeight: '700',
    },
    iconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelOverlay: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: '600',
    },
});
