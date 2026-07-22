@echo off
chcp 932 >nul
cd /d "%~dp0"
echo ============================================
echo  教養バトル 初回Git保存セットアップ
echo  （このフォルダをGitHubの非公開リポジトリに保存します）
echo ============================================
echo.
where git >nul 2>&1
if errorlevel 1 goto NOGIT
where gh >nul 2>&1
if errorlevel 1 goto NOGH

echo [1/5] Gitリポジトリを初期化します...
if not exist ".git" git init >nul 2>&1

echo [2/5] コミット用の名前を設定します（未設定の場合のみ）...
git config user.name >nul 2>&1
if not errorlevel 1 goto SKIPNAME
git config user.name "kyoyo-battle"
git config user.email "kyoyo-battle@example.com"
:SKIPNAME

echo [3/5] ファイルを追加して最初のコミットを作成します...
git add -A >nul 2>&1
git commit -m "初回コミット：教養バトル 夏休み版" >nul 2>&1

echo [4/5] GitHubに非公開リポジトリを作成してアップロードします...
echo     （ブラウザや許可を求められたら画面の指示に従ってください）
gh repo create kyoyo-battle --private --source=. --remote=origin --push
if errorlevel 1 goto FAILPUSH

echo [5/5] 保存先を確認します...
git remote get-url origin
echo.
echo OK: GitHubへの初回保存が完了しました。
echo     次回からは「②_Git保存.bat」をダブルクリックするだけで保存できます。
goto END

:NOGIT
echo NG: Gitが見つかりません。Git for Windows のインストールが必要です。
echo     この画面を閉じずにそのまま見せてください。
goto END
:NOGH
echo NG: GitHub CLI（gh）が見つかりません。
echo     StudyBaseと同じ環境なら入っているはずです。この画面を見せてください。
goto END
:FAILPUSH
echo NG: GitHubへのアップロードに失敗しました。
echo     ・認証切れの場合: いったんこの窓を閉じ、スタートメニューでcmdを開いて
echo       gh auth login を実行し、学校アカウントで許可してから、もう一度このbatを実行してください。
echo     ・それ以外はこの画面をそのまま見せてください。
:END
echo.
pause
