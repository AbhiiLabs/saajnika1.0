import urllib.request
import json

req = urllib.request.Request(
    "https://api.github.com/repos/AbhiiLabs/saajnika1.0/commits?per_page=5",
    headers={"User-Agent": "SaajnikaDeploymentChecker"}
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        commits = json.loads(resp.read().decode())
        for c in commits:
            print(c['sha'][:7], c['commit']['message'], "by", c['commit']['author']['name'], "at", c['commit']['author']['date'])
except Exception as e:
    print("ERROR:", e)
