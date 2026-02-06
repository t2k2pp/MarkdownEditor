import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../styles/theme';
import { FileInfo, getFileExtension } from '../utils/fileHelpers';

interface FileItemProps {
    item: FileInfo;
    isSelected: boolean;
    isExpanded?: boolean;
    depth: number;
    onPress: () => void;
    onToggleExpand?: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({
    item,
    isSelected,
    isExpanded,
    depth,
    onPress,
    onToggleExpand,
}) => {
    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        if (item.isDirectory) {
            return isExpanded ? 'folder-open' : 'folder';
        }
        const ext = getFileExtension(item.name);
        if (ext === '.md' || ext === '.markdown') {
            return 'document-text';
        }
        return 'document-outline';
    };

    const getIconColor = (): string => {
        if (item.isDirectory) {
            return colors.accentOrange;
        }
        const ext = getFileExtension(item.name);
        if (ext === '.md' || ext === '.markdown') {
            return colors.accent;
        }
        return colors.textSecondary;
    };

    const handlePress = () => {
        if (item.isDirectory && onToggleExpand) {
            onToggleExpand();
        } else {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { paddingLeft: spacing.sm + depth * 16 },
                isSelected && styles.selected,
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {item.isDirectory && (
                <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={14}
                    color={colors.textMuted}
                    style={styles.chevron}
                />
            )}
            <Ionicons
                name={getIcon()}
                size={18}
                color={getIconColor()}
                style={styles.icon}
            />
            <Text
                style={[styles.name, isSelected && styles.nameSelected]}
                numberOfLines={1}
                ellipsizeMode="middle"
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs + 2,
        paddingRight: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    selected: {
        backgroundColor: colors.primary + '30',
    },
    chevron: {
        marginRight: 2,
        width: 14,
    },
    icon: {
        marginRight: spacing.xs,
    },
    name: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 13,
    },
    nameSelected: {
        color: colors.primary,
        fontWeight: '500',
    },
});
