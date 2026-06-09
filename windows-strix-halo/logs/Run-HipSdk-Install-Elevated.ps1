$ErrorActionPreference = 'Stop'
try {
  & 'C:\Users\Admin\Documents\Codex\2026-05-18\i-want-to-run-qwen-3\Install-HipSdk-7.1.1.ps1' | Out-File -Encoding utf8 'C:\Users\Admin\Documents\Codex\2026-05-18\i-want-to-run-qwen-3\logs\hip-sdk-7.1.1-install-wrapper-result.json'
} catch {
  $_.Exception.ToString() | Out-File -Encoding utf8 'C:\Users\Admin\Documents\Codex\2026-05-18\i-want-to-run-qwen-3\logs\hip-sdk-7.1.1-install-wrapper.err.log'
  exit 1
}
