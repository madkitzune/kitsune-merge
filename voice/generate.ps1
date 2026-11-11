# Генерує всі репліки з СЦЕНАРІЙ.md через ElevenLabs API.
# Ключ береться зі змінної середовища, у файлі його немає:
#   $env:ELEVENLABS_API_KEY = "..."      (у своєму терміналі)
#   .\generate.ps1 -VoiceId <id голосу> [-Only tut_01] [-Force]
param(
  [Parameter(Mandatory=$true)][string]$VoiceId,
  [string]$Model = "eleven_multilingual_v2",
  [string]$Only = "",
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$key = $env:ELEVENLABS_API_KEY
if (-not $key) { throw "Задай `$env:ELEVENLABS_API_KEY у терміналі" }
$dir = $PSScriptRoot
$lines = Get-Content -Encoding UTF8 (Join-Path $dir "СЦЕНАРІЙ.md") |
  Where-Object { $_ -match '^\|\s*(\w+)\.mp3\s*\|\s*(.+?)\s*\|\s*$' } |
  ForEach-Object { [pscustomobject]@{ Id = $Matches[1]; Text = $Matches[2] } }

foreach ($l in $lines) {
  if ($Only -and $l.Id -ne $Only) { continue }
  $out = Join-Path $dir "$($l.Id).mp3"
  if ((Test-Path $out) -and -not $Force) { Write-Host "skip $($l.Id) (є)"; continue }
  $body = @{
    text = $l.Text; model_id = $Model
    voice_settings = @{ stability = 0.45; similarity_boost = 0.8; style = 0.35; use_speaker_boost = $true }
  } | ConvertTo-Json -Depth 4
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  Invoke-WebRequest -Method Post -Uri "https://api.elevenlabs.io/v1/text-to-speech/$VoiceId`?output_format=mp3_44100_128" `
    -Headers @{ "xi-api-key" = $key; "Accept" = "audio/mpeg" } -ContentType "application/json; charset=utf-8" `
    -Body $bytes -OutFile $out -UseBasicParsing
  Write-Host "ok $($l.Id)"
}
