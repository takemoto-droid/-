@echo off
chcp 932 >nul
cd /d "%~dp0"
echo ============================================
echo  まなクエ 初回Git保存（gh不要・URL入力版）
echo ============================================
echo.
where git >nul 2>&1
if errorlevel 1 goto NOGIT
if not exist ".git" git init >nul 2>&1
git config user.name >nul 2>&1
if not errorlevel 1 goto SKIPNAME
git config user.name "kyoyo-battle"
git config user.email "kyoyo-battle@example.com"
:SKIPNAME
git remote get-url origin >nul 2>&1
if not errorlevel 1 goto HASREMOTE
echo GitHubのサイトで先に空のリポジトリを作り、そのURLを貼り付けてEnter。
echo 例  https://github.com/あなたの名前/kyoyo-battle.git
set /p RURL=URL: 
if "%RURL%"=="" goto NOURL
git remote add origin "%RURL%"
:HASREMOTE
echo ファイルを追加してコミットします...
git add -A >nul 2>&1
git commit -m "初回コミット：まなクエ" >nul 2>&1
git branch -M main >nul 2>&1
echo GitHubへアップロードします。ログイン画面が出たら学校アカウントで許可してください...
git push -u origin main
if errorlevel 1 goto FAILPUSH
echo.
echo OK: GitHubへの初回保存が完了しました。次回からは「②_Git保存.bat」だけでOKです。
goto END
:NOGIT
echo NG: Gitが見つかりません。この画面を見せてください。
goto END
:NOURL
echo NG: URLが入力されませんでした。もう一度このbatを実行してください。
goto END
:FAILPUSH
echo NG: アップロードに失敗しました。この画面をそのまま見せてください。
:END
echo.
pause
