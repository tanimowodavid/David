import requests
# Search Google Books API
query = f"The Total Money Makeover Dave Ramsey"
url = f"https://www.googleapis.com/books/v1/volumes?q={query}"
try:
    resp = requests.get(url, timeout=5).json()
    if "items" in resp:
        book_info = resp["items"][0]["volumeInfo"]
        cover_url = book_info.get("imageLinks", {}).get("thumbnail")
except Exception:
    cover_url = None

print(book_info)
print(cover_url)