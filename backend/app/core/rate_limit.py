from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter (in-memory). Swap storage_uri to Redis for multi-instance.
limiter = Limiter(key_func=get_remote_address, default_limits=[])
