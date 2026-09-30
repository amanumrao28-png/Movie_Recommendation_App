import hashlib
import secrets

def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2 HMAC-SHA256 with 100,000 iterations and a random salt.
    Zero external dependencies required.
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored PBKDF2 hash using constant-time comparison.
    """
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt, stored_hash = hashed_password.split("$", 1)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), stored_hash)
    except Exception:
        return False
