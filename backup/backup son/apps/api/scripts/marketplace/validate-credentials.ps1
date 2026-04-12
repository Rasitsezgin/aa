Param(
    [Parameter(Mandatory = $true)]
    [string]$Platform,

    [Parameter(Mandatory = $true)]
    [string]$CredentialsJson,

    [switch]$Strict
)

$ErrorActionPreference = 'Stop'

function Add-Error {
    Param([string]$Message)
    $script:Errors += $Message
}

function Add-Warning {
    Param([string]$Message)
    $script:Warnings += $Message
}

function Test-RequiredField {
    Param(
        [hashtable]$Creds,
        [string]$FieldName,
        [string]$Hint
    )

    if (-not $Creds.ContainsKey($FieldName)) {
        Add-Error "$FieldName zorunlu. $Hint"
        return
    }

    $value = "$($Creds[$FieldName])".Trim()
    if ([string]::IsNullOrWhiteSpace($value)) {
        Add-Error "$FieldName bos olamaz. $Hint"
        return
    }

    if ($value -match '^(public|test|dummy|fake|sample|null)$') {
        Add-Error "$FieldName gecersiz placeholder deger iceriyor ($value)."
    }
}

function Test-UrlLike {
    Param([string]$Value, [string]$FieldName)

    if (-not ($Value -match '^https?://')) {
        Add-Warning "$FieldName URL degil. Tercihen tam seller/store URL kullanin."
    }
}

$Errors = @()
$Warnings = @()

$normalizedPlatform = $Platform.Trim().ToUpperInvariant()
try {
    $credObj = $CredentialsJson | ConvertFrom-Json -AsHashtable
} catch {
    Write-Host "[ERROR] CredentialsJson parse edilemedi. Gecerli JSON gonderin." -ForegroundColor Red
    exit 2
}

if (-not $credObj) {
    Write-Host "[ERROR] CredentialsJson bos." -ForegroundColor Red
    exit 2
}

# Common required fields
Test-RequiredField -Creds $credObj -FieldName 'apiKey' -Hint 'Platform API key / client id degeri girin.'
Test-RequiredField -Creds $credObj -FieldName 'apiSecret' -Hint 'Platform API secret / token degeri girin.'

switch ($normalizedPlatform) {
    'TRENDYOL' {
        Test-RequiredField -Creds $credObj -FieldName 'supplierId' -Hint 'Trendyol supplierId numerik olmalidir.'
        if ($credObj.ContainsKey('supplierId')) {
            $sid = "$($credObj['supplierId'])".Trim()
            if ($sid -notmatch '^[0-9]+$') {
                Add-Warning 'supplierId numerik formatta degil.'
            }
        }
    }

    'HEPSIBURADA' {
        Test-RequiredField -Creds $credObj -FieldName 'merchantId' -Hint 'Hepsiburada merchantId zorunludur.'
    }

    'N11' {
        # only apiKey/apiSecret required in current bridge
    }

    'CICEKSEPETI' {
        # only apiKey/apiSecret required in current bridge
    }

    'AMAZON' {
        # Current bridge maps apiKey=>sellerId/url, apiSecret=>token
        if ($credObj.ContainsKey('apiKey')) {
            $sellerRef = "$($credObj['apiKey'])".Trim()
            if ($sellerRef.Length -lt 4) {
                Add-Warning 'Amazon seller referansi cok kisa gorunuyor.'
            }
            Test-UrlLike -Value $sellerRef -FieldName 'apiKey (sellerRef)'
        }
    }

    Default {
        Add-Error "Desteklenmeyen platform: $normalizedPlatform"
    }
}

if ($Warnings.Count -gt 0) {
    Write-Host '[WARNINGS]' -ForegroundColor Yellow
    $Warnings | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Yellow }
}

if ($Errors.Count -gt 0) {
    Write-Host '[FAILED]' -ForegroundColor Red
    $Errors | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Red }
    exit 1
}

if ($Strict -and $Warnings.Count -gt 0) {
    Write-Host '[FAILED - STRICT MODE]' -ForegroundColor Red
    exit 1
}

Write-Host '[OK] Credential minimum validation basarili.' -ForegroundColor Green
exit 0
