# Reaction Ranking Bot

自身が行ったリアクション 上位 20位をランキングで出してくれるBot

[new Slack platform](https://api.slack.com/future)で実装してます

new Slack platformにつては、[Slack 次世代プラットフォーム機能のご紹介](https://qiita.com/seratch/items/ecc16b845483c9d6f9e1)を読むのがおすすめです。

## Screenshots

<img width="500" alt="スクリーンショット 2022-12-01 0 51 53" src="https://user-images.githubusercontent.com/2127716/204845022-65923679-8e7b-4ebc-a99b-c8f71054e736.png">


## Setup

### Slack Platform Betaを利用するには有料プランのワークスペースである必要がある

以下のリンクに詳細が書いてありますが、サービス規約に同意するなどの作業が必要です。

https://api.slack.com/future/faq#beta-reqs

### User OAuth Tokenの作成

https://api.slack.com/apps にアクセスして、 [`reactions:read`](https://api.slack.com/scopes/reactions:read)のscopeを持ったSlack appを作ります。

作ったSlack appをワークスペースにインストールして、User OAuth Tokenをコピーします（Bot User OAuth Tokenではなぜかリアクションの履歴がうまく取得できなかったため）。

### env.tsの作成

ディレクトリ直下にenv.tsを作成します。 env.tsの内容を以下のようなにします。

```typescript
import {PopulatedArray} from "https://deno.land/x/deno_slack_api@1.0.1/type-helpers.ts";

export const CHANNEL_IDS: PopulatedArray<string> = ["XXXX","XXXX"];
export const SLACK_API_TOKEN: string = "XXXX";
```

env.tsに記載する内容は以下２つです。
- `CHANNEL_IDS`にどのチャンネルでBotを有効にするかを定義します（ここで設定したチャンネルのみでBotにメンションすると動作します）。
- `SLACK_API_TOKEN`に作成したUser OAuth Tokenを入れます。



### deployとtrigger作成

env.tsを作成したら`slack deploy`でデプロイして、`slack trigger create --trigger-def ./triggers/mention_trigger.ts`でトリガーを作成します。

これらが完了するとワークスペースに `@reaction ranking`というBotがインストールされているはずです。

env.tsの`CHANNEL_IDS`に定義したチャンネルで`@reaction ranking`Botにメンションすれば、リアクションランキングを投稿してくれます。


## Usage

### Develop

```shell
slack run
```

### Deploy

```shell
slack deploy
```

### Add a trigger

```shell
slack trigger create --trigger-def ./triggers/mention_trigger.ts
```
