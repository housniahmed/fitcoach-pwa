# FitCoach · Practical Coach

PWA mobile de coaching personnel pour un programme de musculation 3×/semaine.

## Principe

FitCoach est conçu pour être utilisé **pendant l'entraînement**, pas pour faire de l'analyse compliquée.

À chaque exercice, l'application donne :
- la fourchette de répétitions ;
- la cible de charge quand une référence existe ;
- le RIR cible ;
- le temps de repos ;
- la performance de la dernière séance ;
- un retour simple après chaque série : garder, progresser ou récupérer.

En fin de séance :
- durée ;
- volume ;
- nombre de séries ;
- conseil simple pour la prochaine fois.

## Fonctionnalités

- Séances A/B/C guidées exercice par exercice
- Illustrations des exercices
- Suivi des séries, répétitions, charges et RIR
- Adaptation simple de la série suivante
- Timer de repos 90 s
- Reprise d'une séance interrompue
- Historique local
- Progression des charges
- Poids du corps
- Fonctionnement hors ligne
- Installation PWA

## Données

Les données existantes restent dans le stockage local du navigateur. La V8 simplifie le moteur et l'interface sans demander de recommencer l'historique.

## Règle produit V8

> Chaque fonctionnalité doit aider concrètement pendant l'entraînement. Sinon, elle n'entre pas dans FitCoach.

## Déploiement

Le dépôt est publié avec GitHub Pages via le workflow GitHub Actions situé dans `.github/workflows/pages.yml`.

