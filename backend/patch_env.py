def get_url():
    url = os.getenv("DATABASE_URL", "")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if "?schema=" in url:
        url = url.split("?schema=")[0]
    return url
