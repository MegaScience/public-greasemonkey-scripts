@echo off
:: Based on: http://stackoverflow.com/a/17388270/5857393
:: Use: getProperName "%toFolder%" "%frFolder%" "%fName%" "%fName%"
setlocal
set toFolder=%~1
set frFolder=%~2
set fName=%~3
set fType=%~4
set "file=%fName%"
cd ..\%toFolder%
if not exist "%file%.%fType%" goto result
:loop
set /a fCounter+=1
set "file=%fName%-%fcounter%"
if exist "%file%.%fType%" goto loop
:result
cd ..\%frFolder%
echo %file%
endlocal
