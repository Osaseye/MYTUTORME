$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts
foreach ($file in $files) {
    if ($file.FullName -match "Tour|tourStore") { continue }
    $txt = Get-Content $file.FullName -Raw
    $original = $txt
    
    # Remove data attributes
    $txt = [regex]::Replace($txt, '\s?data-tour-target="[^"]+"', '')
    
    # Remove useTourStore import
    $txt = [regex]::Replace($txt, '(?m)^import\s+\{.*useTourStore.*\}\s+from\s+[''"].*tourStore[''"];\r?\n?', '')
    
    # Remove const { startTour } = useTourStore();
    $txt = [regex]::Replace($txt, '(?m)^\s*const\s+\{\s*startTour\s*\}\s*=\s*useTourStore\(\);\r?\n?', '')
    
    # Remove useEffect calling startTour
    $txt = [regex]::Replace($txt, '(?s)\s*useEffect\(\(\)\s*=>\s*\{\r?\n?\s*startTour\([''"][^''"]+[''"]\);\r?\n?\s*\},\s*\[startTour\]\);\r?\n?', '')
    
    if ($txt -cne $original) {
        Set-Content -Path $file.FullName -Value $txt -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}
