$ErrorActionPreference = "Stop"
if (-not $env:PORT -or $env:PORT -eq "") {
  $env:PORT = "3777"
}

while ($true) {
  try {
    Write-Host "Starting server on port $env:PORT ..."
    node server.js
  } catch {
    Write-Host "Server crashed: $($_.Exception.Message)"
  }
  Start-Sleep -Seconds 2
}
