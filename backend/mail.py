import smtplib
from email.mime.text import MIMEText
import config


def send_verify_request(username: str, email: str, userid: str):
    msg = MIMEText(
        f"User '{username}' ({email}) has requested publisher verification.\n\n"
        f"To approve, run:\n"
        f"  db.users.updateOne({{_id: ObjectId('{userid}')}}, {{$set: {{verified: true}}}})"
    )
    msg["Subject"] = "TUES Calendar - Publisher Verification Request"
    msg["From"] = config.MAIL_USERNAME
    msg["To"] = config.ADMIN_EMAIL

    with smtplib.SMTP(config.MAIL_SERVER, config.MAIL_PORT) as server:
        server.starttls()
        server.login(config.MAIL_USERNAME, config.MAIL_PASSWORD)
        server.send_message(msg)
