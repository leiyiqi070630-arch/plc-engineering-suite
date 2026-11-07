function Resolve-WeinviewCodecPython {
 $bridge=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
 $bundled=[IO.Path]::GetFullPath((Join-Path $bridge '..\engine\python\python.exe'))
 if(Test-Path -LiteralPath $bundled -PathType Leaf){return $bundled}
 $sourceRoot=[IO.Path]::GetFullPath((Join-Path $bridge '..\..'))
 $locations=Join-Path $sourceRoot '.local\project-locations.json'
 $channel=Join-Path $sourceRoot '.local\builds\demo5\channel-state.json'
 if(!(Test-Path -LiteralPath $locations -PathType Leaf) -or !(Test-Path -LiteralPath $channel -PathType Leaf)){throw 'Bundled Weinview Python runtime required.'}
 $project=Get-Content -LiteralPath $locations -Raw -Encoding UTF8|ConvertFrom-Json
 if([string]$project.projectRoot -cne $sourceRoot){throw 'Source project root differs from local runtime manifest.'}
 $state=Get-Content -LiteralPath $channel -Raw -Encoding UTF8|ConvertFrom-Json
 $current=[IO.Path]::GetFullPath([string]$state.current)
 $buildRoot=[IO.Path]::GetFullPath((Join-Path $sourceRoot '.local\builds\demo5'))
 if(!$current.StartsWith($buildRoot+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Current isolated DEMO runtime path is outside project builds.'}
 $python=Join-Path ([IO.Path]::GetDirectoryName($current)) 'resources\engine\python\python.exe'
 if(!(Test-Path -LiteralPath $python -PathType Leaf)){throw 'Bundled Weinview Python runtime required.'}
 return $python
}
