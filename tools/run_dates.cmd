@echo off
chcp 65001 >nul
echo ---- %DATE% %TIME% ---- >> "C:\Users\JrFli\toursbybrad\tools\dates.log"
"C:\Users\JrFli\AppData\Local\Programs\Python\Python312\python.exe" "C:\Users\JrFli\toursbybrad\tools\publish_dates.py" >> "C:\Users\JrFli\toursbybrad\tools\dates.log" 2>&1
