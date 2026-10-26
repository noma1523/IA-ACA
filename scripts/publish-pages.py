"""Publie la démo statique sur la branche gh-pages avec l’authentification Git existante."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def git(*arguments, data=None, environment=None):
    return subprocess.check_output(
        ["git", "-C", str(ROOT), *arguments],
        input=data,
        env=environment,
        text=True,
    ).strip()


subprocess.run([sys.executable, str(ROOT / "scripts/build-pages.py")], check=True)
output = ROOT / "pages-site"
remote = git("ls-remote", "--heads", "origin", "refs/heads/gh-pages")
parent = remote.split()[0] if remote else None
if parent:
    git("fetch", "--no-tags", "origin", "refs/heads/gh-pages:refs/remotes/origin/gh-pages")
    names = set(git("ls-tree", "--name-only", parent).splitlines())
    expected = {"index.html", "prototype-v9.html", ".nojekyll", "CNAME"}
    if not names.issubset(expected):
        raise SystemExit("La branche gh-pages contient d’autres fichiers ; publication arrêtée pour les préserver.")

with tempfile.TemporaryDirectory(prefix="academie-pages-index-") as temporary:
    environment = {**os.environ, "GIT_INDEX_FILE": str(Path(temporary) / "index")}
    git("read-tree", "--empty", environment=environment)
    for name in ("index.html", "prototype-v9.html", ".nojekyll"):
        blob = git("hash-object", "-w", str(output / name))
        git("update-index", "--add", "--cacheinfo", f"100644,{blob},{name}", environment=environment)
    if parent and "CNAME" in names:
        existing = git("ls-tree", parent, "CNAME").split()
        git("update-index", "--add", "--cacheinfo", f"{existing[0]},{existing[2]},CNAME", environment=environment)
    tree = git("write-tree", environment=environment)
    if parent and git("rev-parse", parent + "^{tree}") == tree:
        print("La branche gh-pages contient déjà cette démo. Aucun nouveau commit nécessaire.")
        sys.exit(0)
    arguments = ["commit-tree", tree, "-m", "Publish Académie IA static demonstration"]
    if parent:
        arguments.extend(["-p", parent])
    commit = git(*arguments)

subprocess.run(
    ["git", "-C", str(ROOT), "push", "origin", f"{commit}:refs/heads/gh-pages"],
    check=True,
)
print("Branche gh-pages publiée. L’activation et la disponibilité de GitHub Pages restent à vérifier.")
