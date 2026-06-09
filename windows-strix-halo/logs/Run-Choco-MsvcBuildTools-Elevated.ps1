$ErrorActionPreference = 'Stop'
try {
  & 'C:\Users\Admin\Documents\Codex\2026-05-18\i-want-to-run-qwen-3\Install-Choco-MsvcBuildTools.ps1' | Out-File -Encoding utf8 'C:\Users\Admin\Documents\Codex\2026-05-18\i-want-to-run-qwen-3\logs\choco-msvc-buildtools-result.json'
} catch {
  $_.Exception.ToString() | Out-File -Encoding utf8 'C:\Users\Admin\Documents\Codex\2026-05-18\i-want-to-run-qwen-3\logs\choco-msvc-buildtools.err.log'
  exit 1
}
