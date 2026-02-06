/**
 * アプリ全体のテーマ・カラー定義
 */

export const colors = {
    // プライマリカラー
    primary: '#6366f1',        // インディゴ
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',

    // バックグラウンド
    background: '#0f0f23',     // ダークネイビー
    surface: '#1a1a2e',        // カード背景
    surfaceLight: '#252542',   // ツールバー背景

    // テキスト
    textPrimary: '#f1f5f9',    // 白に近いグレー
    textSecondary: '#94a3b8',  // 薄いグレー
    textMuted: '#64748b',      // さらに薄いグレー

    // アクセント
    accent: '#22d3ee',         // シアン
    accentOrange: '#fb923c',   // オレンジ
    accentGreen: '#4ade80',    // グリーン
    accentPink: '#f472b6',     // ピンク

    // ボーダー
    border: '#374151',
    borderLight: '#4b5563',

    // ステータス
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',

    // 透明度
    overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const borderRadius = {
    sm: 6,
    md: 12,
    lg: 16,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 36,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};
