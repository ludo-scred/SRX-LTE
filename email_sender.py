import smtplib
import socket
import subprocess
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.utils import formatdate
from email import encoders


def GetUUID():
    cmd = 'wmic csproduct get uuid'
    uuid = str(subprocess.check_output(cmd))
    pos1 = uuid.find("\\n")+2
    uuid = uuid[pos1:-15]
    return uuid


def send_mail(message,
              server="smtp.smart-rx.com", port=465, username='airbox@perso.smart-rx.com', password='88ed70b174'):
    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = "airbox@perso.smart-rx.com"
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = "Airbox_" + str(GetUUID()) + ".xlsx"

    msg.attach(MIMEText(message))

    path = "Airbox_" + str(GetUUID()) + ".xlsx"
    part = MIMEBase('application', "octet-stream")
    with open(path, 'rb') as file:
        part.set_payload(file.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition',
                    'attachment; filename={}'.format(Path(path).name))
    msg.attach(part)

    smtp = smtplib.SMTP_SSL(server, port)
    smtp.login(username, password)
    smtp.sendmail(username, "airbox@perso.smart-rx.com", msg.as_string())
    smtp.quit()