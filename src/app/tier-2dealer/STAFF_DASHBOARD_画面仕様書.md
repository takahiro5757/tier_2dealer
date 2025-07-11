---

# 1. 画面名

---

**ダッシュボード**

![image.png](image.png)

---

# 2. 要素別仕様

---

## 2-1. 稼働情報カード

![image.png](image%201.png)

### UI 要素・コントロール・I/O

| 要素名         | コントロール種類 | I/O | 説明                                 |
|----------------|------------------|-----|--------------------------------------|
| 稼働情報カード | カード           | 出力| 本日の現場・時間・ステータスを表示   |
| お知らせ       | アラート         | 出力| 重要なお知らせ・注意事項を表示       |

### イベント定義

| イベント名         | 発生タイミング | イベント概要               | 遷移先 | バリデーション |
|--------------------|---------------|----------------------------|--------|----------------|
| 稼働詳細タップ     | カード押下時   | 稼働詳細ドロワー表示       | なし   | なし           |

---

## 2-2. ナビゲーションリンク

![image.png](image%202.png)

### UI 要素・コントロール・I/O

| 要素名         | コントロール種類 | I/O | 説明                                 |
|----------------|------------------|-----|--------------------------------------|
| シフト希望入力 | ボタン/リンク    | 入力| シフト希望入力画面へ遷移             |
| 提出状況確認   | ボタン/リンク    | 入力| シフト提出状況確認画面へ遷移         |

### イベント定義

| イベント名         | 発生タイミング | イベント概要               | 遷移先                | バリデーション |
|--------------------|---------------|----------------------------|-----------------------|----------------|
| シフト希望入力遷移 | ボタン押下時   | シフト希望入力画面へ遷移   | /staff/input          | なし           |
| 提出状況確認遷移   | ボタン押下時   | シフト提出状況確認画面へ遷移| /staff/check          | なし           |

---

# 3. その他仕様（要素に収まらない共通ルールや制約）

- 稼働情報カードは本日・明日・今週など複数表示可
- お知らせは未読時のみ強調表示
- レスポンシブ対応：スマホでは縦並び、PCでは横並び
- アクセシビリティ：カード・ボタンはキーボード操作・コントラスト4.5:1以上
- 稼働詳細は右スライドインのドロワー形式 