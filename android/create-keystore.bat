@echo off
REM Gera keystore de release. Execute a partir da pasta android/.
REM As senhas serao solicitadas interativamente — nao as grave em arquivos versionados.

set KEYTOOL="C:\Program Files\Java\jdk-17\bin\keytool.exe"
if not exist %KEYTOOL% set KEYTOOL=keytool

%KEYTOOL% -genkey -v ^
  -keystore app/notemusic-release-key.keystore ^
  -alias notemusic-key-alias ^
  -keyalg RSA -keysize 2048 -validity 10000 ^
  -dname "CN=NoteMusic, OU=Development, O=NoteMusic, L=SaoPaulo, S=SP, C=BR"

echo.
echo Depois copie keystore.properties.example para keystore.properties e preencha as senhas.
