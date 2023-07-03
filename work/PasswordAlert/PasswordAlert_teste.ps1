$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$date = Get-Date
Function Global:Send-Email{
    $User = "helpdesk@tecnobank.com.br"
    $pass = Get-Content "$ScriptPath\passMail\password.txt"
    $key = Get-Content "$ScriptPath\passMail\key.txt"
    $Password = ($pass) | ConvertTo-SecureString -Key ($key)

    $ccrecipients = "infra@tecnobank.com.br"
    $signature = "$ScriptPath\tecnobank.png"
    $att = new-object System.Net.Mail.Attachment($signature)
    $att.ContentType.MediaType = “image/png” 
    $att.ContentId = “Attachment”
    $From = "Helpdesk <helpdesk@tecnobank.com.br>"
    $SMTPServer = "smtp.office365.com"
    $SMTPPort = "587"
    $to = "$recipients"
    $cc = "$ccRecipients"

    $message = New-Object System.Net.Mail.MailMessage
    $message.Attachments.Add($att)
    $message.subject = $subject
    $message.IsBodyHtml = $True
    $message.body = $body
    $message.to.add($to)
    $message.cc.add($cc)
    $message.from = $From

    $smtp = New-Object Net.Mail.SmtpClient($SMTPServer, $SMTPPort);
    $smtp.EnableSSL = $true
    $smtp.Credentials = New-Object System.Net.NetworkCredential($User, $Password);
    $smtp.send($message)
    $att.Dispose()
}

$Users = Get-ADUser -Server "tb-dc-062" -filter {Enabled -eq $True -and PasswordNeverExpires -eq $False} -Properties msDS-UserPasswordExpiryTimeComputed, PasswordLastSet, CannotChangePassword, mail, GivenName, SamAccountName
$date = (Get-Date).AddDays(5)
foreach ($user in $users){
    $expire = $user | Select-Object Name, @{Name="ExpiryDate";Expression={[datetime]::FromFileTime($_."msDS-UserPasswordExpiryTimeComputed")}}, PasswordLastSet, mail, GivenName, SamAccountName 

    if($($expire.ExpiryDate) -ge (Get-Date) -and $($expire.ExpiryDate) -le $date){
        $vcto = New-TimeSpan -Start $(Get-Date).AddDays(-1) -End "$($expire.ExpiryDate.ToShortDateString())"
        Write-Host "$($expire.GivenName) - $($expire.ExpiryDate.ToShortDateString()) - $($expire.mail) - $($expire.SamAccountName)"
        
        if ($($vcto.Days) -eq "0"){
            #$recipients = "rodrigo.biagi@tecnobank.com.br"
            $recipients = "$($expire.mail)"
            $subject = "SUA SENHA EXPIROU FAVOR SEGUIR O PROCEDIMENTO NO CORPO DO E-MAIL"
            #$body += "<b>TESTE DE E-MAIL</b><br>"
            $body += "Olá, $($expire.GivenName)<br><br>"
            $body += "<b><font size='4' color='red'>SUA SENHA EXPIROU FAVOR SEGUIR O PROCEDIMENTO ABAXO.</font></b><br><br>"
            $body += "<b>LEIA ATENTAMENTE ESTE E-MAIL!</b><br><br>"
            $body += "Para trocar a senha, use o Portal de Senhas, clicando em <a href='https://aka.ms/sspr'>https://aka.ms/sspr</a> de preferência conectado na VPN para em seguida atualiza-la imediatamente no seu computador.<br><br>"
            $body += "Quando você utiliza o computador sem estar conectado na VPN, a autenticação (digitação do login e senha) ocorre em cache, ou seja, o Windows utiliza a senha que está armazenada e não a nova senha cadastrada no portal.<br><br>"
            $body += "Assim, depois que trocar a senha no portal, conectado na VPN, digite CTRL + ALT + DEL para fazer o bloqueio do Windows/sessão, depois faço o desbloqueio digitando a nova senha cadastrada no portal.<br><br>"
            $body += "Caso precise configurar e-mail alternativo, celular ou perguntas de segurança, acesse o link <a href='https://aka.ms/ssprsetup'>https://aka.ms/ssprsetup</a>.<br><br>"
            $body += "Lembrando que todas as senhas devem conter no mínimo 9 caracteres, contendo letras (maiúsculas e minúsculas), números e caracteres especiais.<br><br>"
            $body += "O sistema não aceita senhas usadas anteriormente e nem partes do login.<br><br>"
            $body += "As senhas expiram após 75 dias<br><br><br>"
            $body += "Atenciosamente, <br><br>"
            $body += "<b>Equipe de Infraestrutura</b><br>"
            $body += "<img src='cid:Attachment' /><br>"
            $body += "*Mensagem automática, apenas para efeito tecnico<br><br>"
            #Send-Email
        }
        elseif (($($vcto.Days)) -eq "1"){
            #$recipients = "rodrigo.biagi@tecnobank.com.br"
            $recipients = "$($expire.mail)"
            $subject = "HOJE É O ÚLTIMO DIA PARA TROCAR SUA SENHA"
            #$body += "<b>TESTE DE E-MAIL</b><br>"
            $body += "Olá, $($expire.GivenName)<br><br>"
            $body += "<b><font size='4' color='red'>HOJE É O ÚLTIMO DIA PARA TROCAR SUA SENHA.</font></b><br><br>"
            $body += "<b>LEIA ATENTAMENTE ESTE E-MAIL!</b><br><br>"
            $body += "Para trocar a senha, use o Portal de Senhas, clicando em <a href='https://aka.ms/sspr'>https://aka.ms/sspr</a> de preferência conectado na VPN para em seguida atualiza-la imediatamente no seu computador.<br><br>"
            $body += "Quando você utiliza o computador sem estar conectado na VPN, a autenticação (digitação do login e senha) ocorre em cache, ou seja, o Windows utiliza a senha que está armazenada e não a nova senha cadastrada no portal.<br><br>"
            $body += "Assim, depois que trocar a senha no portal, conectado na VPN, digite CTRL + ALT + DEL para fazer o bloqueio do Windows/sessão, depois faço o desbloqueio digitando a nova senha cadastrada no portal.<br><br>"
            $body += "Caso precise configurar e-mail alternativo, celular ou perguntas de segurança, acesse o link <a href='https://aka.ms/ssprsetup'>https://aka.ms/ssprsetup</a>.<br><br>"
            $body += "Lembrando que todas as senhas devem conter no mínimo 9 caracteres, contendo letras (maiúsculas e minúsculas), números e caracteres especiais.<br><br>"
            $body += "O sistema não aceita senhas usadas anteriormente e nem partes do login.<br><br>"
            $body += "As senhas expiram após 75 dias<br><br><br>"
            $body += "Atenciosamente, <br><br>"
            $body += "<b>Equipe de Infraestrutura</b><br>"
            $body += "<img src='cid:Attachment' /><br>"
            $body += "*Mensagem automática, apenas para efeito tecnico<br><br>"
            #Send-Email
        }
        else{
            #$recipients = "rodrigo.biagi@tecnobank.com.br"
            $recipients = "$($expire.mail)"
            $subject = "Sua senha de rede expira em $($vcto.Days) dia(s)"
            #$body += "<b>TESTE DE E-MAIL</b><br>"
            $body += "Olá, $($expire.GivenName)<br><br>"
            $body += "Sua senha de rede expira em <b><font size='4' color='red'>$($vcto.Days)</font></b> dia(s).<br><br>"
            $body += "<b>LEIA ATENTAMENTE ESTE E-MAIL!</b><br><br>"
            $body += "Para trocar a senha, use o Portal de Senhas, clicando em <a href='https://aka.ms/sspr'>https://aka.ms/sspr</a> de preferência conectado na VPN para em seguida atualiza-la imediatamente no seu computador.<br><br>"
            $body += "Quando você utiliza o computador sem estar conectado na VPN, a autenticação (digitação do login e senha) ocorre em cache, ou seja, o Windows utiliza a senha que está armazenada e não a nova senha cadastrada no portal.<br><br>"
            $body += "Assim, depois que trocar a senha no portal, conectado na VPN, digite CTRL + ALT + DEL para fazer o bloqueio do Windows/sessão, depois faço o desbloqueio digitando a nova senha cadastrada no portal.<br><br>"
            $body += "Caso precise configurar e-mail alternativo, celular ou perguntas de segurança, acesse o link <a href='https://aka.ms/ssprsetup'>https://aka.ms/ssprsetup</a>.<br><br>"
            $body += "Lembrando que todas as senhas devem conter no mínimo 9 caracteres, contendo letras (maiúsculas e minúsculas), números e caracteres especiais.<br><br>"
            $body += "O sistema não aceita senhas usadas anteriormente e nem partes do login.<br><br>"
            $body += "As senhas expiram após 75 dias<br><br><br>"
            $body += "Atenciosamente, <br><br>"
            $body += "<b>Equipe de Infraestrutura</b><br>"
            $body += "<img src='cid:Attachment' /><br>"
            $body += "*Mensagem automática, apenas para efeito tecnico<br><br>"
            #Send-Email
        }
        Clear-Variable body, subject, recipients
    }
}