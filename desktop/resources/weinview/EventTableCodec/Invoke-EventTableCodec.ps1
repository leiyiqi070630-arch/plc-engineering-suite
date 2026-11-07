param(
    [Parameter(Mandatory=$true)][string]$RequestPath,
    [Parameter(Mandatory=$true)][string]$ResponsePath
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Resolve-CodecPython.ps1')
$helper = Resolve-WeinviewCodecPython
$script = Join-Path $PSScriptRoot 'source\event_table_codec.py'
if (-not (Test-Path -LiteralPath $script -PathType Leaf)) { throw 'EventTableCodec source missing' }
if (-not (Test-Path -LiteralPath $RequestPath -PathType Leaf)) { throw 'Request JSON missing' }
if (Test-Path -LiteralPath $ResponsePath) { throw 'Fresh response path required' }
$requestAbsolute = [System.IO.Path]::GetFullPath($RequestPath)
$responseAbsolute = [System.IO.Path]::GetFullPath($ResponsePath)
# The app's bundled Python runs the same source contract; no PATH or user Python lookup.
$output = & $helper -B $script $requestAbsolute $responseAbsolute 2>&1
$code = $LASTEXITCODE
if (-not (Test-Path -LiteralPath $responseAbsolute -PathType Leaf)) {
    throw ('Codec failed without JSON receipt: exit ' + $code + ' ' + ($output -join ' '))
}
$raw = [System.IO.File]::ReadAllText($responseAbsolute,[System.Text.Encoding]::UTF8)
$result = $raw | ConvertFrom-Json
if ($code -ne 0 -or -not $result.ok) { throw ('Codec rejected request: ' + $result.message) }
$raw
