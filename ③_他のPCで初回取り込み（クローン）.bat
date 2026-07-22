@echo off
chcp 932 >nul
cd /d "%~dp0"
echo ============================================
echo  まなクエ 初回取り込み（クローン・gh不要）
echo  ＝ もう一方のPCで最初の1回だけ使います
echo ============================================
echo.
where git >nul 2>&1
if errorlevel 1 goto NOGIT
if exist "教養バトル\.git" goto ALREADY
echo GitHubのリポジトリURLを貼り付けてEnter。
echo 例  https://github.com/あなたの名前/kyoyo-battle.git
set /p RURL=URL: 
if "%RURL%"=="" goto NOURL
git clone "%RURL%" "教養バトル"
if errorlevel 1 goto FAILCLONE
echo.
echo OK: このbatの隣に「教養バトル」フォルダができました。
echo 次回からは、そのフォルダの中の「④_最新に更新.bat」で最新にできます。
goto END
:ALREADY
echo すでに「教養バトル」フォルダがあります。中の「④_最新に更新.bat」を使ってください。
goto END
:NOGIT
echo NG: Gitが見つかりません。この画面を見せてください。
goto END
:NOURL
echo NG: URLが入力されませんでした。もう一度実行してください。
goto END
:FAILCLONE
echo NG: 取り込みに失敗しました。この画面をそのまま見せてください。
:END
echo.
pause
