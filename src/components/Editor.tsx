import React, { forwardRef } from 'react';
import {
    TextInput,
    StyleSheet,
    TextInputProps,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
} from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

interface EditorProps extends Omit<TextInputProps, 'onSelectionChange'> {
    onSelectionChange?: (selection: { start: number; end: number }) => void;
}

export const Editor = forwardRef<TextInput, EditorProps>(
    ({ onSelectionChange, ...props }, ref) => {
        const handleSelectionChange = (
            event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
        ) => {
            if (onSelectionChange) {
                onSelectionChange(event.nativeEvent.selection);
            }
        };

        return (
            <TextInput
                ref={ref}
                style={styles.editor}
                multiline
                textAlignVertical="top"
                placeholder="ここにマークダウンを入力..."
                placeholderTextColor={colors.textMuted}
                onSelectionChange={handleSelectionChange}
                autoCapitalize="none"
                autoCorrect={false}
                {...props}
            />
        );
    }
);

Editor.displayName = 'Editor';

const styles = StyleSheet.create({
    editor: {
        flex: 1,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        fontSize: typography.body.fontSize,
        lineHeight: typography.body.lineHeight * 1.5,
        padding: spacing.md,
        fontFamily: 'monospace',
    },
});
