$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

git config user.name "teccardiobr-hue"
git config user.email "223556219+Copilot@users.noreply.github.com"

function Get-WorkspaceChanges {
    $status = git status --porcelain
    if (-not $status) { return $false }
    return $true
}

while ($true) {
    try {
        if (Get-WorkspaceChanges) {
            git add -A
            $summary = git diff --cached --stat
            git commit -m "Atualizacao automatica do aplicativo"
            git push origin main
            Write-Output "$(Get-Date -Format 'HH:mm:ss') - Alteracoes enviadas ao GitHub Pages."
        }
    } catch {
        Write-Output "$(Get-Date -Format 'HH:mm:ss') - Sincronizacao pendente: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 5
}
