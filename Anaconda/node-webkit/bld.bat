call "C:\Program Files (x86)\Microsoft Visual Studio 9.0\VC\vcvarsall.bat" amd64
set CMAKE_GENERATOR=Visual Studio 9 2008 Win64
@echo on
set TMP=C:\DOCUME~1\builder\LOCALS~1\Temp
set COMPUTERNAME=BUILD-296V5KH3O
set ANA_LEVEL=1827
set PROCESSOR_REVISION=3a09
set INTEL_LICENSE_FILE=C:\Program Files (x86)\Common Files\Intel\Licenses
set VS100COMNTOOLS=C:\Program Files (x86)\Microsoft Visual Studio 10.0\Common7\Tools\
set PY_VER=2.7
set INTEL_DEV_REDIST=C:\Program Files (x86)\Common Files\Intel\Shared Libraries\
set VS90COMNTOOLS=C:\Program Files (x86)\Microsoft Visual Studio 9.0\Common7\Tools\
set COMMONPROGRAMFILES=C:\Program Files\Common Files
set IFORT_COMPILER14=C:\Program Files (x86)\Intel\Composer XE 2013 SP1\
set PROCESSOR_IDENTIFIER=EM64T Family 6 Model 58 Stepping 9, GenuineIntel
set SRC_URL=http://filer/src/
set PROGRAMFILES=C:\Program Files
set IFORT_COMPILER13=C:\Program Files (x86)\Intel\Composer XE 2013\
set PATH=C:\aroot\stage\Library\bin;C:\aroot\stage;C:\aroot\stage\Scripts;%PATH%
set MINICONDA_MENUS=0
set SYSTEMROOT=C:\WINDOWS
set ANA_PY=27
set REPLACE=C:\Python27\Scripts\replace.exe
set ARCH=64
set MIC_LD_LIBRARY_PATH=C:\Program Files (x86)\Common Files\Intel\Shared Libraries\compiler\lib\mic
set MENU_DIR=C:\aroot\stage\Menu
set UCS=2
set TEMP=C:\DOCUME~1\builder\LOCALS~1\Temp
set COMMONPROGRAMFILES(X86)=C:\Program Files (x86)\Common Files
set USERDOMAIN=BUILD-296V5KH3O
set PROCESSOR_ARCHITECTURE=AMD64
set STDLIB_DIR=C:\aroot\stage\Lib
set PROGRAMFILES(X86)=C:\Program Files (x86)
set ALLUSERSPROFILE=C:\Documents and Settings\All Users
set LIBRARY_LIB=C:\aroot\stage\Library\lib
set RELEASE_TARGET=Release^|x64
set SESSIONNAME=Console
set HOMEPATH=\Documents and Settings\builder
set SYS_PYTHON=C:\Python27\python.exe
set USERNAME=builder
set AROOT=C:\aroot
set LOGONSERVER=\\BUILD-296V5KH3O
set PROMPT=$P$G
set COMSPEC=C:\WINDOWS\system32\cmd.exe
set MKL_VERSION=^<NO MKL HEADER FOUND^>
set LIBRARY_BIN=C:\aroot\stage\Library\bin
set RECIPE_DIR=c:\anaconda\packages\node-webkit-0.10.1
set PKG_VERSION=0.10.1
set PKG_NAME=node-webkit
set EXAMPLES=C:\aroot\stage\Examples
set FILES_DIR=c:\anaconda\files
set PY3K=0
set PATHEXT=.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH
set FP_NO_HOST_CHECK=NO
set WINDIR=C:\WINDOWS
set PYTHON=C:\aroot\stage\python.exe
set HOMEDRIVE=C:
set APPDATA=C:\Documents and Settings\builder\Application Data
set CONDA_BUILD=1
set DISTRO_BUILD=1
set SYSTEMDRIVE=C:
set LIBRARY_INC=C:\aroot\stage\Library\include
set PREFIX=C:\aroot\stage
set NUMBER_OF_PROCESSORS=1
set INTEL_ARCH=intel64
set MINICONDA=1
set PROCESSOR_LEVEL=6
set SUBDIR=win-64
set LIBRARY_PREFIX=C:\aroot\stage\Library
set SCRIPTS=C:\aroot\stage\Scripts
set SYS_PREFIX=C:\Python27
set SRC_DIR=C:\aroot\work\node-webkit-v0.10.1-win-ia32
set SP_DIR=C:\aroot\stage\Lib\site-packages
set OS=Windows_NT
set PRO=0
set USERPROFILE=C:\Documents and Settings\builder
REM ===== end generated header =====
mkdir "%PREFIX%\node-webkit"
if errorlevel 1 exit 1

xcopy /E .\* "%PREFIX%\node-webkit\"
if errorlevel 1 exit 1

mkdir "%SCRIPTS%"
if errorlevel 1 exit 1

set bin="%SCRIPTS%\node-webkit.bat"
echo "%%~dp0\..\node-webkit\nw.exe" %%* >> %bin%
