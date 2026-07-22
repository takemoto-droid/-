@echo off
chcp 932 >nul
cd /d "%~dp0"
echo ============================================
echo  教養バトル Git保存（変更をGitHubに保存）
echo ============================================
echo.
where git >nul 2>&1
if errorlevel 1 goto NOGIT
if not exist ".git" goto NOREPO

echo [1/3] 変更を追加します...
git add -A >nul 2>&1

echo [2/3] コミットを作成します...
set "STAMP=%date% %time%"
git commit -m "更新 %STAMP%" >nul 2>&1
if errorlevel 1 goto NOCHANGE

echo [3/3] GitHubにアップロードします...
git push origin HEAD
if errorlevel 1 goto FAILPUSH
echo.
echo OK: 保存が完了しました。
goto END

:NOCHANGE
echo OK: 変更はありませんでした（すでに最新の状態です）。
goto END
:NOGIT
echo NG: Gitが見つかりません。この画面を見せてください。
goto END
:NOREPO
echo NG: まだ初回セットアップがされていません。
echo     先に「①_初回Git保存セットアップ.bat」をダブルクリックしてください。
goto END
:FAILPUSH
echo NG: アップロードに失敗しました。
echo     認証切れの可能性があります。この画面をそのまま見せてください。
:END
echo.
pause
