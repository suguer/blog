---
title: "Email"
date: 2021-10-31T20:09:52+08:00
draft: true
---

#### 下载邮件内容
使用前 composer require php-imap/php-imap
```php
$mailbox = new Mailbox(
    '{SMTP服务器:SMTP端口号/imap}INBOX', // IMAP server and mailbox folder
    '邮箱账号', // Username for the before configured mailbox
    '邮箱密码', // Password for the before configured username
    null, // Directory, where attachments will be saved (optional)
    'UTF-8' // Server encoding (optional)
);

try {
    $mailsIds = $mailbox->searchMailbox('ALL');
} catch (PhpImap\Exceptions\ConnectionException $ex) {
    echo "IMAP connection failed: " . $ex;
    die();
}
rsort($mailsIds);
foreach ($mailsIds as $key => $item) {
//循环遍历
    $mail = $mailbox->getMail($item);
    $fromAddress = $mail->fromAddress;
    $content = $mail->textHtml;
    // $mail->subject;标题
    // $mail->date;发件日期
}
```