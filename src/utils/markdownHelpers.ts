/**
 * マークダウン記法挿入ヘルパー関数
 */

export interface TextSelection {
    start: number;
    end: number;
}

export interface InsertResult {
    newText: string;
    newSelection: TextSelection;
}

/**
 * カーソル位置または選択範囲にマークダウン記法を挿入
 */
export function insertMarkdown(
    text: string,
    selection: TextSelection,
    prefix: string,
    suffix: string = '',
    placeholder: string = ''
): InsertResult {
    const beforeSelection = text.substring(0, selection.start);
    const selectedText = text.substring(selection.start, selection.end);
    const afterSelection = text.substring(selection.end);

    const insertText = selectedText || placeholder;
    const newText = beforeSelection + prefix + insertText + suffix + afterSelection;

    const newCursorPos = selection.start + prefix.length + insertText.length + suffix.length;

    return {
        newText,
        newSelection: { start: newCursorPos, end: newCursorPos }
    };
}

/**
 * 見出しを挿入
 */
export function insertHeading(text: string, selection: TextSelection, level: number): InsertResult {
    const prefix = '#'.repeat(level) + ' ';
    const lines = text.split('\n');
    let charCount = 0;
    let targetLineIndex = 0;

    // 現在の行を見つける
    for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= selection.start) {
            targetLineIndex = i;
            break;
        }
        charCount += lines[i].length + 1; // +1 for newline
    }

    // 行の先頭に見出し記号を追加
    const currentLine = lines[targetLineIndex];
    const cleanLine = currentLine.replace(/^#{1,6}\s*/, ''); // 既存の見出しを削除
    lines[targetLineIndex] = prefix + cleanLine;

    const newText = lines.join('\n');
    const newPos = charCount + prefix.length + cleanLine.length;

    return {
        newText,
        newSelection: { start: newPos, end: newPos }
    };
}

/**
 * 太字を挿入
 */
export function insertBold(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '**', '**', 'テキスト');
}

/**
 * 斜体を挿入
 */
export function insertItalic(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '*', '*', 'テキスト');
}

/**
 * 罫線を挿入
 */
export function insertHorizontalRule(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '\n---\n', '', '');
}

/**
 * 箇条書き（番号なし）を挿入
 */
export function insertBulletList(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '- ', '', 'リスト項目');
}

/**
 * 番号付きリストを挿入
 */
export function insertNumberedList(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '1. ', '', 'リスト項目');
}

/**
 * コードブロックを挿入
 */
export function insertCodeBlock(text: string, selection: TextSelection): InsertResult {
    const selectedText = text.substring(selection.start, selection.end);
    if (selectedText.includes('\n') || selectedText === '') {
        // 複数行または空の場合はコードブロック
        return insertMarkdown(text, selection, '```\n', '\n```', 'コード');
    } else {
        // 単一行はインラインコード
        return insertMarkdown(text, selection, '`', '`', 'コード');
    }
}

/**
 * 引用を挿入
 */
export function insertQuote(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '> ', '', '引用テキスト');
}

/**
 * リンクを挿入
 */
export function insertLink(text: string, selection: TextSelection): InsertResult {
    const selectedText = text.substring(selection.start, selection.end);
    if (selectedText) {
        return insertMarkdown(text, selection, '[', '](URL)', '');
    }
    return insertMarkdown(text, selection, '[リンクテキスト](', ')', 'URL');
}

/**
 * チェックボックスを挿入
 */
export function insertCheckbox(text: string, selection: TextSelection): InsertResult {
    return insertMarkdown(text, selection, '- [ ] ', '', 'タスク');
}
