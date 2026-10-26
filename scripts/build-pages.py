"""Prépare uniquement la démo statique pour GitHub Pages, sans données privées."""

import argparse
import hashlib
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--output", type=Path, default=ROOT / "pages-site")
args = parser.parse_args()

archive = ROOT / "academie_ia_dossier_codex.zip"
with ZipFile(archive) as bundle:
    if bundle.testzip() is not None:
        raise SystemExit("L’archive du prototype est corrompue.")
    prototype = bundle.read("academie-ia-codex/prototype-v9.html")

output = args.output.resolve()
output.mkdir(parents=True, exist_ok=True)
(output / "prototype-v9.html").write_bytes(prototype)
(output / ".nojekyll").write_text("", encoding="utf-8")
(output / "index.html").write_text(
    """<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Démonstration interactive de l’Académie IA : 22 modules, 132 leçons et parcours simulés.">
  <title>Académie IA — Démonstration</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; }
    body { display: flex; flex-direction: column; height: 100dvh; background: #f6f8fc; font: 13px/1.5 system-ui, sans-serif; color: #22314f; }
    .demo-notice { flex: none; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 10px 18px; background: #fff8e6; border-bottom: 1px solid #efdfb7; text-align: center; }
    .demo-notice strong { color: #80611d; white-space: nowrap; }
    .demo-notice span { color: #776947; font-size: 11px; }
    iframe { display: block; border: 0; width: 100%; flex: 1; min-height: 0; background: #f6f8fc; }
    .skip { position: absolute; left: -10000px; }
    .skip:focus { left: 10px; top: 10px; background: #fff; padding: 10px; z-index: 10; }
    @media (max-width: 600px) { .demo-notice { flex-direction: column; gap: 2px; padding: 8px 12px; } .demo-notice strong { font-size: 11px; } .demo-notice span { font-size: 9px; } }
  </style>
</head>
<body>
  <a class="skip" href="#prototype">Accéder à la démonstration</a>
  <header class="demo-notice" role="note" aria-label="Information sur la démonstration">
    <strong>Académie IA · Démonstration gratuite</strong>
    <span>Comptes, paiements et accès simulés. Progression stockée dans ce navigateur. Utilisez des informations fictives.</span>
  </header>
  <iframe id="prototype" title="Prototype interactif de l’Académie IA" src="./prototype-v9.html" allowfullscreen></iframe>
</body>
</html>
""",
    encoding="utf-8",
)
print(f"Démo statique préparée dans {output}")
print(f"SHA-256 du prototype : {hashlib.sha256(prototype).hexdigest()}")
