@echo off
setlocal

call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if errorlevel 1 exit /b %errorlevel%

set "HIP_PATH=C:\Program Files\AMD\ROCm\7.1"
set "ROCM_PATH=C:\Program Files\AMD\ROCm\7.1"
set "PATH=C:\Program Files\CMake\bin;C:\Program Files\AMD\ROCm\7.1\bin;C:\Program Files\AMD\ROCm\7.1\lib;C:\ProgramData\mingw64\mingw64\bin;C:\VulkanSDK\1.4.341.0\Bin;C:\Program Files\LLVM\bin;%PATH%"

if "%1"=="configure-only" goto configure
if not exist "tools\rocmfp4-llama\build-rocmfp4-hip-win-msvc\build.ninja" goto configure

:build
cmake --build tools\rocmfp4-llama\build-rocmfp4-hip-win-msvc -j 16 --target llama-server llama-cli llama-bench
exit /b %errorlevel%

:configure
cmake -S tools\rocmfp4-llama -B tools\rocmfp4-llama\build-rocmfp4-hip-win-msvc -G Ninja ^
  -DCMAKE_BUILD_TYPE=Release ^
  -DCMAKE_C_COMPILER="C:\Program Files\AMD\ROCm\7.1\bin\clang.exe" ^
  -DCMAKE_CXX_COMPILER="C:\Program Files\AMD\ROCm\7.1\bin\clang++.exe" ^
  -DCMAKE_PREFIX_PATH="C:\Program Files\AMD\ROCm\7.1;C:\Program Files\AMD\ROCm\7.1\cmake" ^
  -DAMDGPU_TARGETS=gfx1151 ^
  -DGPU_TARGETS=gfx1151 ^
  -DGGML_HIP=ON ^
  -DGGML_VULKAN=OFF ^
  -DGGML_CUDA=OFF ^
  -DLLAMA_BUILD_SERVER=ON ^
  -DLLAMA_BUILD_WEBUI=OFF ^
  -DLLAMA_USE_PREBUILT_WEBUI=OFF ^
  -DLLAMA_BUILD_TESTS=OFF ^
  -DGGML_BUILD_TESTS=OFF
if errorlevel 1 exit /b %errorlevel%
if "%1"=="configure-only" exit /b 0
goto build
