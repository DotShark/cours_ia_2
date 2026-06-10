# Cours IA 2

Série d'ateliers d'introduction au machine learning et au deep learning, en Python avec scikit-learn et PyTorch.

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

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Données

Les datasets MNIST et CIFAR-10 sont téléchargés automatiquement par torchvision dans le dossier `ateliers/data/`. Le fichier `titanic.csv` doit être présent dans `ateliers/data/`.

## Structure

```
cours_ia_2/
├── ateliers/
│   ├── atelier1.ipynb
│   ├── ...
│   ├── atelier7.ipynb
│   ├── data/          # datasets (titanic.csv, CIFAR-10)
│   ├── onnx/          # modèles exportés
│   └── data_loader.py
└── requirements.txt
```
