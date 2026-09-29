@echo off
title MAX - AI PC Voice Assistant
color 0b
echo ========================================================
echo        MAX - AI PC Voice Assistant Setup and Runner
echo ========================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found on your system!
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b
)

:: Prompt for Anthropic API key if not set
if "%ANTHROPIC_API_KEY%"=="" (
    echo [!] ANTHROPIC_API_KEY environment variable is not set.
    set /p USER_KEY="Enter your Anthropic API Key (sk-ant-...): "
    if not "%USER_KEY%"=="" (
        set ANTHROPIC_API_KEY=%USER_KEY%
    )
)

echo.
echo Installing requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo [Note] If PyAudio fails on Windows, install it via: pip install pipwin ^&^& pipwin install pyaudio
)

echo.
echo Starting MAX AI Voice Assistant...
python max.py
pause
