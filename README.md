# FitCoach 3×

PWA mobile de coaching personnel pour un programme de musculation 3×/semaine.

## Fonctionnalités
- Séances A/B/C guidées exercice par exercice
- Suivi des séries, répétitions et charges
- Timer de récupération
- Historique des entraînements
- Volume, durée et fréquence
- Records par exercice
- Fonctionnement hors ligne
- Installation PWA

## Déploiement
Le dépôt peut être publié avec GitHub Pages : Settings → Pages → Deploy from branch → main → / (root).

## Données
Les données d'entraînement sont stockées localement dans le navigateur via localStorage dans cette V1.


## FitCoach V7.9 — Personalized Strategy Optimizer

V7.9 adds context-aware strategy selection on top of V7.8 Strategy Outcome Learning.

- Captures the exact strategy actually executed for each exercise.
- Builds a compact coaching context from session, recovery band, fatigue band, effort/RIR band and adaptive mode.
- Compares historical outcomes in matching contexts before falling back to broader exercise history.
- Uses confidence, recent trend and outcome score to select a personalized strategy.
- Persists the selected strategy, context key and learning version with the session result.
- Keeps the learning deterministic, local and explainable.

Decision loop:

`exercise + context → candidate strategies → context-matched outcomes → personalized strategy → execution → exact outcome attribution → updated strategy model`

The optimizer is a coaching heuristic, not a clinical or machine-learning model.
