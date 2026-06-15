# Cours IA 2

> **Repo :** [github.com/DotShark/cours_ia_2](https://github.com/DotShark/cours_ia_2)

Série d'ateliers d'introduction au machine learning et au deep learning, en Python avec scikit-learn et PyTorch. Le cours se conclut par un projet de classification de sons urbains avec export ONNX et une interface web Vue 3.

## Ateliers

| Notebook | Sujet |
|---|---|
| [atelier1.ipynb](ateliers/atelier1.ipynb) | Analyse exploratoire — dataset Titanic (pandas, matplotlib) |
| [atelier2.ipynb](ateliers/atelier2.ipynb) | Classification — dataset Iris (KNN, arbre de décision, forêt aléatoire, validation croisée) |
| [atelier3.ipynb](ateliers/atelier3.ipynb) | Bases de PyTorch — tenseurs, autograd, construction de réseaux |
| [atelier4.ipynb](ateliers/atelier4.ipynb) | MLP sur MNIST — réseau dense, entraînement, évaluation |
| [atelier5.ipynb](ateliers/atelier5.ipynb) | MLP sur CIFAR-10 — limites des réseaux denses sur images couleur |
| [atelier6.ipynb](ateliers/atelier6.ipynb) | CNN sur CIFAR-10 — réseaux convolutifs, export ONNX |
| [atelier7.ipynb](ateliers/atelier7.ipynb) | Fine-tuning ResNet18 sur CIFAR-10 — transfer learning |

## Projet — Classification de sons urbains

Entraînement et déploiement d'un modèle de classification audio sur les datasets **ESC-50** et **UrbanSound8K**, avec une interface web Vue 3 pour l'inférence en temps réel via ONNX.

### Notebooks

| Notebook | Sujet |
|---|---|
| [entrainement_esc50.ipynb](projet/esc50/entrainement_esc50.ipynb) | CNN sur ESC-50 — spectrogrammes mel, entraînement, export ONNX |
| [entrainement_resnet18_esc50.ipynb](projet/esc50/entrainement_resnet18_esc50.ipynb) | ResNet18 sur ESC-50 — transfer learning |
| [entrainement_urban_sound_8k.ipynb](projet/urban_sound_8k/entrainement_urban_sound_8k.ipynb) | CNN sur UrbanSound8K — entraînement, export ONNX |
| [entrainement_resnet18_urban_sound_8k.ipynb](projet/urban_sound_8k/entrainement_resnet18_urban_sound_8k.ipynb) | ResNet18 sur UrbanSound8K — transfer learning |

### Interface web

Application Vue 3 + TypeScript (Vite) permettant de charger un fichier audio et d'obtenir une classification en temps réel via le modèle ONNX.

```bash
cd projet/webapp
npm install
npm run dev
```

## Installation (notebooks)

```bash
python -m venv .venv
source .venv/bin/activate  # Windows : .venv\Scripts\activate
pip install -r requirements.txt
```

## Données

- **MNIST / CIFAR-10** : téléchargés automatiquement par torchvision dans `ateliers/data/`
- **Titanic** : `titanic.csv` à placer dans `ateliers/data/`
- **ESC-50 / UrbanSound8K** : datasets audio à placer dans `projet/esc50/audio/` et `projet/urban_sound_8k/audio/`

## Structure

```
cours_ia_2/
├── ateliers/
│   ├── atelier1.ipynb … atelier7.ipynb
│   ├── data/              # datasets (titanic.csv, CIFAR-10, MNIST)
│   ├── onnx/              # modèles exportés
│   └── data_loader.py
├── projet/
│   ├── esc50/
│   │   ├── entrainement_esc50.ipynb
│   │   ├── entrainement_resnet18_esc50.ipynb
│   │   ├── audio/         # dataset ESC-50
│   │   └── onnx/          # modèles exportés
│   ├── urban_sound_8k/
│   │   ├── entrainement_urban_sound_8k.ipynb
│   │   ├── entrainement_resnet18_urban_sound_8k.ipynb
│   │   ├── audio/         # dataset UrbanSound8K
│   │   └── onnx/          # modèles exportés
│   └── webapp/            # interface Vue 3 + TypeScript
└── requirements.txt
```
