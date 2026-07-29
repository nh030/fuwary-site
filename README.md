# Fuwary サイト

- ふわりぃ（サロン＋南河内本校の講座）: https://nh030.github.io/fuwary-site/
- い～よぉ（フットサロン＋平野店の講座）: https://nh030.github.io/fuwary-site/iiyo.html

## 料金や文章の変え方

**編集用スプレッドシート**
https://docs.google.com/spreadsheets/d/15VfrCymdVu9U75Dilv_6x8i_7PvdImh5qd0oPvwEF_s/edit

このシートを書き換えて保存すると、サイトを開き直したときに内容が切り替わります。
GitHub の更新は不要です（スマホからでも編集できます）。

| シート | 内容 |
| --- | --- |
| メニュー | 施術メニュー。「ページ」列が `ふわりぃ` / `い～よぉ` の振り分け。行を足せばメニューが増えます |
| オプション | ふわりぃのオプションメニュー |
| スペシャル | ご褒美スペシャルコース |
| 講座 | 講座。「ページ」列でどちらのページに出すかを指定 |
| 基本情報 | 紹介文・営業時間・住所・ご案内文、および LINE / Instagram の URL |

- LINE と Instagram のボタンは、基本情報シートの `salon.line` `salon.instagram` `foot.line` `foot.instagram` `school.line` `school.instagram` に URL を入れると有効になります（空のうちは案内メッセージが出ます）。
- 「ご案内」などの文章では `<br>`（改行）や `<b>`（太字）が使えます。
- シートが読み込めなかったときは、HTML に書かれている内容がそのまま表示されます。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `index.html` | ふわりぃのページ |
| `iiyo.html` | い～よぉのページ |
| `style.css` | 共通のデザイン |
| `app.js` | スプレッドシート読み込み・ナビ制御 |
| `assets/` | ロゴ3点とチラシ掲載の写真3点 |

デザインや構成を変えたときは `git push` すると 1 分ほどで公開サイトに反映されます。
