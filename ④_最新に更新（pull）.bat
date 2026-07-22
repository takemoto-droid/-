@echo off
chcp 932 >nul
cd /d "%~dp0"
echo ============================================
echo  まなクエ 最新に更新（pull）
echo  ＝ 編集を始める前に押してください
echo ============================================
echo.
where git >nul 2>&1
if errorlevel 1 goto NOGIT
if not exist ".git" goto NOREPO
git pull
if errorlevel 1 goto FAILPULL
echo.
echo OK: 最新に更新しました。編集を始めてください。
goto END
:NOGIT
echo NG: Gitが見つかりません。この画面を見せてください。
goto END
:NOREPO
echo NG: このフォルダはまだGit保存されていません。先に①または③を行ってください。
goto END
:FAILPULL
echo NG: 更新に失敗しました。この画面をそのまま見せてください。
echo    もし conflict と出たら、両方のPCで編集がぶつかっています。見せてください。
:END
echo.
pause
