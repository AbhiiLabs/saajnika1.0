import urllib.request

try:
    with urllib.request.urlopen("https://saajnika1-0.onrender.com/", timeout=10) as resp:
        print("ROOT STATUS:", resp.status)
        print("ROOT BODY:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("ROOT HTTP ERROR:", e.code)
    print("BODY:", e.read().decode()[:200])
except Exception as e:
    print("ERROR:", type(e), e)
