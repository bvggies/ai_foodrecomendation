$env:PATH = ".\node_modules\.bin;$env:PATH"
Set-Location $PSScriptRoot
node ".\node_modules\.bin\next" dev
