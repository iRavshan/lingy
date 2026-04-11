import requests
from django.conf import settings


def verify_turnstile(token, remote_ip=None):
    """
    Verify a Cloudflare Turnstile token server-side.
    Returns True if valid, False otherwise.
    """
    if not token:
        return False

    payload = {
        'secret': settings.TURNSTILE_SECRET_KEY,
        'response': token,
    }
    if remote_ip:
        payload['remoteip'] = remote_ip

    try:
        resp = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data=payload,
            timeout=10
        )
        result = resp.json()
        return result.get('success', False)
    except Exception:
        return False
