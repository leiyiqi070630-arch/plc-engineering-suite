# Native Recipe Database .db record exchange. Caller obtains the current
# project's original-vendor export, owns workspace paths, and imports the
# returned .db back into that same editable project.
function Invoke-WeinviewRecipeDatabaseCodec([string]$PythonExe,[string]$RequestPath,[string]$ResponsePath) {
 if(!$PythonExe){$PythonExe=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\engine\python\python.exe'))}
 if(!(Test-Path -LiteralPath $PythonExe -PathType Leaf) -or [IO.Path]::GetFileName($PythonExe) -cne 'python.exe'){throw 'Bundled engine Python runtime required'}
 if(!(Test-Path -LiteralPath $RequestPath -PathType Leaf) -or (Test-Path -LiteralPath $ResponsePath)){throw 'Existing request and fresh response paths required'}
 $codec=Join-Path $PSScriptRoot 'RecipeDatabaseRecords.py'
 if(!(Test-Path -LiteralPath $codec -PathType Leaf)){throw 'Recipe Database codec missing'}
 $output=& $PythonExe $codec $RequestPath $ResponsePath 2>&1
 $code=$LASTEXITCODE
 if(!(Test-Path -LiteralPath $ResponsePath -PathType Leaf)){throw ('Recipe Database codec returned no receipt: '+$code+' '+($output -join ' '))}
 $result=[IO.File]::ReadAllText($ResponsePath,[Text.Encoding]::UTF8)|ConvertFrom-Json
 if($code -ne 0 -or !$result.ok){throw ('Recipe Database codec rejected request: '+$result.error)}
 return $result
}
