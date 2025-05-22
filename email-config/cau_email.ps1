param(
    [string]$To,
    [string]$Cc,  
    [string]$Bcc,
    [string]$Asunto,
    [string]$Cuerpo,
    [string]$Adjunto
)

# Determinar si es ruta absoluta o relativa
if ([System.IO.Path]::IsPathRooted($Adjunto)) {
    # Si es ruta absoluta, usarla directamente
    $adjuntoPath = $Adjunto
} else {
    # Si es relativa, combinarla con la ubicación del script
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $adjuntoPath = Join-Path $scriptDir $Adjunto
}

# Verifica que el archivo existe
if (!(Test-Path $adjuntoPath)) {
    Write-Output "❌ Archivo no encontrado: $adjuntoPath"
    exit 1
}


# Crear objeto Outlook
$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")
$cuentaEnvio = $namespace.Accounts | Where-Object { $_.SmtpAddress -eq "cau@emtmadrid.es" }

if ($cuentaEnvio -eq $null) {
    Write-Output "❌ No se encontró la cuenta 'cau@emtmadrid.es'."
    exit 1
}

# Crear y configurar el correo
$mail = $outlook.CreateItem(0)
$mail.To = $To
$mail.CC = $Cc
$mail.BCC = $Bcc
$mail.Subject = $Asunto
$mail.Body = $Cuerpo
$mail.SentOnBehalfOfName = "cau@emtmadrid.es"
$mail.Attachments.Add($adjuntoPath)

# Enviar
$mail.Send()
Write-Output "✅ Correo enviado correctamente a $To"