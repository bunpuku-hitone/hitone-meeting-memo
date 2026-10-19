# あい右衛門 メール送信API（初期実装）

このディレクトリは会議メモアプリから独立した送信APIです。現在はResendを送信プロバイダーとして利用します。後日、やわすプラットフォームの送信機能に交換できます。

## セットアップ（未実施）
1. Resendで送信ドメインを認証し、送信元アドレスを決める。
2. Cloudflare Workersに worker.js をデプロイする。
3. Workerのシークレットに RESEND_API_KEY、TURNSTILE_SECRET を設定し、FROM_EMAIL に認証済みドメインの送信元アドレスを設定する。ALLOWED_ORIGIN は https://bunpuku-hitone.github.io にする。
4. Cloudflare Turnstileをサイトに組み込み、発行されたトークンを送信リクエストに含める。
5. 公開前にCloudflare側で送信APIのレート制限を設定する。Originチェックだけでは悪用を防げない。
6. Worker URLを会議メモアプリの設定に反映する。

## API契約
POST / (Content-Type: application/json)
{ "to":"user@example.com", "subject":"会議メモ：会議名", "text":"メモ全文", "turnstileToken":"..." }

成功: { "ok": true }。失敗: { "error": "..." }。

**注意:** 現時点でメール送信は有効化されていません。APIキーをGitHubの公開コードやチャットに貼らないでください。送信者名「あい右衛門」は、認証済みの送信元アドレスが確定した後にResendの from フィールドに設定します。
