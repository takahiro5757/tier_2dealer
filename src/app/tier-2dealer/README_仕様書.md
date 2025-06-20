# 2次店（tier-2dealer）画面・機能仕様書

---

## 1. 目的・想定読者

- **想定読者**  
  - 開発者（実装・保守を担当するエンジニア）
  - クライアント（発注者・業務担当者・要件確認者）

- **目的**  
  2次店（tier-2dealer）配下の画面・機能の要件・仕様を明文化し、実装・テスト・運用・レビュー時の共通認識とする。

---

## 2. 構成・全体像

- **大分類**
  - `/admin` … 2次店管理者用画面
  - `/staff` … 2次店スタッフ用画面

---

## 3. 画面・機能の一覧と概要

| パス                | 画面名                 | 目的・役割                                                                                   |
|---------------------|------------------------|----------------------------------------------------------------------------------------------|
| `/admin/shifts`     | シフト管理画面         | 2次店管理者が自社のシフトを管理。Ansteype連携・提出・修正依頼もここから行う。                |
| `/admin/staff`      | スタッフ管理画面       | 2次店管理者が自社スタッフ情報を管理・編集。                                                  |
| `/admin/login`      | 管理者ログイン画面     | 管理者用ログイン。                                                                           |
| `/staff/dashboard`  | ダッシュボード         | スタッフが稼働時に自分の稼働情報をすぐ確認できるトップページ。                               |
| `/staff/input`      | シフト希望入力画面     | スタッフが自分のシフト希望（ある月の出勤・休日希望等）を入力・提出。                         |
| `/staff/check`      | シフト提出状況確認画面 | スタッフが自分のシフト情報（提出状況や確定内容等）を確認。                                   |
| `/staff/login`      | スタッフログイン画面   | スタッフ用ログイン。                                                                         |

---

## 4. 業務フロー・利用シナリオ

1. **スタッフ**がシフト希望を入力・提出（`/staff/input`）
2. **2次店管理者**が提出状況を回収・確認（`/admin/shifts`）
3. **2次店管理者**が全員分揃ったらAnsteypeに提出・修正依頼（`/admin/shifts`）
4. **Ansteype**がシフト希望をもとに現場を順次決定
5. **スタッフ**が確定した稼働情報をダッシュボード等で確認（`/staff/dashboard`, `/staff/check`）
6. **2次店管理者**が必要に応じてスタッフ情報を管理・追加（`/admin/staff`）

---

## 5. 画面ごとの詳細仕様・UI要件

### `/admin/shifts` シフト管理画面
- **主な機能**
  - スタッフごとのシフト提出状況一覧
  - スタッフのシフト内容確認
  - Ansteypeへの一括提出・修正依頼
  - スタッフごとの要望・コメント確認
- **UI要件**
  - 提出状況は色分けされたバッジやカードで表示
  - スタッフ一覧はテーブル形式、詳細はモーダルやドロワーで表示
  - 提出ボタン・修正依頼ボタンは明確に区別
- **イメージ例**
  ```
  ┌─────────────┬─────────────┬─────────────┐
  │ 氏名        │ 提出状況    │ 要望        │
  ├─────────────┼─────────────┼─────────────┤
  │ 田中太郎    │ 提出済み🟢 │ 土日希望    │
  │ 佐藤花子    │ 未提出🟡   │ 平日希望    │
  └─────────────┴─────────────┴─────────────┘
  [全スタッフシフトを提出] [修正依頼]
  ```

### `/admin/staff` スタッフ管理画面
- **主な機能**
  - スタッフ情報の一覧・追加・編集・削除
- **UI要件**
  - テーブル形式でスタッフ情報を表示
  - 編集・削除はアイコンボタンで直感的に
- **イメージ例**
  ```
  ┌─────────────┬─────────────┬─────────────┐
  │ 氏名        │ 役職        │ 電話番号    │
  ├─────────────┼─────────────┼─────────────┤
  │ 田中太郎    │ クローザー  │ 090-xxxx    │
  │ 佐藤花子    │ ガール      │ 090-yyyy    │
  └─────────────┴─────────────┴─────────────┘
  [スタッフ追加]
  ```

### `/staff/dashboard` ダッシュボード
- **主な機能**
  - 本日の稼働情報・今後の予定表示
  - シフト希望入力や提出状況確認へのリンク
- **UI要件**
  - カード形式で本日の現場・時間・ステータスを表示
  - 重要なお知らせはアラート表示
- **イメージ例**
  ```
  ┌─────────────┐
  │ 本日の稼働   │
  │ 現場: ○○○    │
  │ 時間: 10:00~ │
  │ ステータス: 確定🟢 │
  └─────────────┘
  [シフト希望入力] [提出状況確認]
  ```

### `/staff/input` シフト希望入力画面
- **主な機能**
  - カレンダー形式で希望日を選択
  - 要望・コメント入力
  - 提出ボタン
- **UI要件**
  - 日付ごとに○×-などの選択肢
  - 入力内容は即時保存 or 提出時にまとめて送信
- **イメージ例**
  ```
  [2025年6月]
  ┌─┬─┬─┬─┬─┬─┬─┐
  │日│月│火│水│木│金│土│
  ├─┼─┼─┼─┼─┼─┼─┤
  │○│×│-│○│○│×│-│ ...
  └─┴─┴─┴─┴─┴─┴─┘
  [要望・コメント入力欄]
  [提出]
  ```

### `/staff/check` シフト提出状況確認画面
- **主な機能**
  - 提出済みシフトの内容・確定状況表示
  - 管理者からのコメント・承認状況表示
- **UI要件**
  - ステータスごとに色分け・アイコン表示
  - 確定内容は見やすく一覧化
- **イメージ例**
  ```
  ┌─────────────┬─────────────┬─────────────┐
  │ 日付        │ 希望        │ 確定        │
  ├─────────────┼─────────────┼─────────────┤
  │ 6/1         │ ○          │ 確定🟢      │
  │ 6/2         │ ×          │ 休み🟡      │
  └─────────────┴─────────────┴─────────────┘
  [管理者コメント: 6/1は現場Aに決定]
  ```

---

## 6. 備考

- シフト提出・修正依頼時は「希望日」と「要望」のみAnsteypeに連携
- スタッフ管理画面は、提出対象スタッフが増えた場合の登録・管理用途

---

（この仕様書は今後の要件追加・変更に応じて随時アップデートしてください） 