@echo off
title Ultimate Bravery - Dev Server
cd /d "%~dp0app"
call npm run dev -- --open
pause
