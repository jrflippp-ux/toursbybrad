@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ---- %DATE% %TIME% ---- >> "dates.log"
py -3.12 "publish_dates.py" >> "dates.log" 2>&1
