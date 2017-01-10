@echo off
:: Based on: http://stackoverflow.com/a/17388270/5857393
:: Use: getProperName "%toFolder%" "%frFolder%" "%fileName%" "%fileName%"
setlocal
set toFolder=%~1
set frFolder=%~2
set fileName=%~3
set fileType=%~4
set "file=%fileName%"
cd ..\%toFolder%
if not exist "%file%.%fileType%" goto result
:loop
set /a fCounter+=1
set "file=%fileName%-%fCounter%"
if exist "%file%.%filType%" goto loop
:result
cd ..\%frFolder%
echo %file%
endlocal
