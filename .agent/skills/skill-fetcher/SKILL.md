---
name: skill-fetcher
description: Tool Storeからプロジェクトに必要なスキル、サブエージェント、MCPを取得するメタスキル。開発開始時に最初に読み込むべきスキル。
---

# Skill Fetcher

Tool Store（GitHub）から必要なツールをプロジェクトに取得するスキル。

---

## 使用方法

### 1. ユーザーがやりたいことを伝える
```
例: 「Flutterでヘルスケアアプリを作りたい」
```

### 2. catalog.yaml からツール推奨
```yaml
# キーワードマッチング
keywords: [flutter, ヘルスケア]
  ↓
推奨ツール:
  skills: [flutter-development, flutter-tdd, flutter-native-integration]
  subagents: [flutter-developer, flutter-tdd-runner]
  common: [ai-flutter-guidelines]
```

### 3. ユーザー承認

### 4. ツール取得・配置
```
プロジェクト/
└── .agent/
    ├── skills/
    │   ├── flutter-development/
    │   ├── flutter-tdd/
    │   └── ai-flutter-guidelines/
    ├── subagents/
    │   ├── flutter-developer.md
    │   └── flutter-tdd-runner.md
    └── workflows/
        └── development-flow.md
```

---

## 取得コマンド

### 単一ツール取得

#### PowerShell（Windows）
```powershell
# スキル取得
New-Item -ItemType Directory -Force -Path ".agent/skills/flutter-development"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/t2k2pp/ToolStore/master/domains/mobile/flutter/skills/flutter-development/SKILL.md" -OutFile ".agent/skills/flutter-development/SKILL.md"

# サブエージェント取得
New-Item -ItemType Directory -Force -Path ".agent/subagents"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/t2k2pp/ToolStore/master/domains/mobile/flutter/subagents/flutter-developer.md" -OutFile ".agent/subagents/flutter-developer.md"
```

#### Bash（macOS/Linux）
```bash
# スキル取得
curl -sL https://raw.githubusercontent.com/t2k2pp/ToolStore/master/domains/mobile/flutter/skills/flutter-development/SKILL.md \
  -o .agent/skills/flutter-development/SKILL.md --create-dirs

# サブエージェント取得
curl -sL https://raw.githubusercontent.com/t2k2pp/ToolStore/master/domains/mobile/flutter/subagents/flutter-developer.md \
  -o .agent/subagents/flutter-developer.md --create-dirs
```

### 一括取得（推奨）
```powershell
# Gitスパースチェックアウト
git clone --filter=blob:none --sparse https://github.com/t2k2pp/ToolStore.git .tool-cache
cd .tool-cache
git sparse-checkout set domains/mobile/flutter/skills/flutter-development
Copy-Item -Recurse domains/mobile/flutter/skills/flutter-development ../.agent/skills/
```

---

## AI実行フロー

```
1. catalog.yaml をGitHubから読み込む
   URL: https://raw.githubusercontent.com/t2k2pp/ToolStore/master/catalog.yaml

2. ユーザーの要件からキーワード抽出
   - 技術: flutter, react, python など
   - 機能: ヘルスケア, 認証, 決済 など
   - 作業: テスト, デバッグ, レビュー など

3. recommendations セクションでマッチング
   - keywords にマッチする suggest を収集
   - 必須ツール（required: true）を追加

4. 推奨ツール一覧をユーザーに提示
   | カテゴリ | ツール名 | 説明 |
   |---------|---------|------|
   | skill | flutter-development | Riverpod 3.0実装ガイド |
   | skill | ai-flutter-guidelines | AI開発禁止事項【必須】 |
   | subagent | flutter-developer | 実装担当 |

5. ユーザー承認後、ツール取得コマンド実行

6. 開発開始
```

---

## 取得先ディレクトリ構成

```
.agent/
├── skills/           # スキル（知識ベース）
│   ├── [skill-id]/
│   │   └── SKILL.md
│   └── ...
├── subagents/        # サブエージェント
│   ├── [subagent-id].md
│   └── ...
├── workflows/        # ワークフロー
│   ├── [workflow-id].md
│   └── ...
└── mcps/             # MCP設定
    └── [mcp-id]/
        └── config.json
```

---

## 注意事項

1. **ai-flutter-guidelinesは必須**
   - Flutter開発では常に含める
   - AI禁止事項が記載されている

2. **依存関係を解決**
   - dependencies に指定されたツールも取得

3. **最新版を取得**
   - main ブランチから取得
   - バージョン固定が必要な場合はタグ指定

---

## カタログURL

- **カタログ**: https://raw.githubusercontent.com/t2k2pp/ToolStore/master/catalog.yaml
- **リポジトリ**: https://github.com/t2k2pp/ToolStore
