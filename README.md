# Description du Projet - Visualisation Impact Data Centers

## Quel est le problème abordé / à quel besoin répondez vous ? 

L'impact environnemental du numérique, et plus particulièrement des centres de données (*data centers*), constitue une préoccupation majeure mais demeure souvent abstrait et peu visible pour le grand public (« le cloud »). Le problème abordé réside dans la difficulté, pour les gestionnaires d'infrastructures comme pour les utilisateurs, de visualiser concrètement la consommation énergétique liée au matériel serveur.

Notre projet combine des **données de consommation énergétique réelles** (UCBL1, Portugal) avec des **données d'efficacité énergétique** (PUE, SpecPower) et des **données d'impact carbone** (Climatiq, Google CFE). L'objectif est de rendre ces informations tangibles et explorables, en établissant un lien clair entre le matériel physique, son usage et son coût environnemental en termes d'énergie et d'émissions de CO₂.

## Public et Tâches
**Public principal :** Administrateurs systèmes, décideurs IT (DSI), étudiants et chercheurs.

**3 Tâches principales :**
1. **Comparer l'efficacité énergétique du matériel :** Identifier quels serveurs et composants offrent les meilleurs ratios performance/consommation (via les benchmarks SpecPower et TechPowerUp).
2. **Visualiser la consommation dans le temps :** Observer les pics de consommation énergétique et les corréler avec l'activité (via les données UCBL1 et Portugal).
3. **Contextualiser l'impact régional :** Comprendre comment l'intensité carbone varie selon les régions cloud (via les données Google CFE et Climatiq).

*Pourquoi ces tâches ?* Elles permettent de passer de la simple constatation théorique à l'action concrète (choix de matériel, localisation des charges de travail, optimisation).

## Sources de données utilisées

Ce projet utilise les sources de données suivantes :

| Source | Description | Lien |
|--------|-------------|------|
| **Uptime Institute** | Historique du PUE (Power Usage Effectiveness) moyen mondial des data centers (2007-2025) | [Uptime Institute Global Survey](https://uptimeinstitute.com/resources/research-and-reports/uptime-institute-global-data-center-survey-2023) |
| **Climatiq** | Émissions CO₂ par région cloud (AWS, Azure, GCP) et PUE des fournisseurs | [Climatiq API](https://www.climatiq.io/) |
| **Google Cloud CFE** | Pourcentage d'énergie décarbonée et intensité carbone par région Google Cloud (2019-2024) | [Google Cloud Sustainability](https://cloud.google.com/sustainability/region-carbon) |
| **Next10.org (California)** | Projections d'impact environnemental des data centers en Californie (2019-2028) | [Next10 - AI Environmental Impacts](https://www.next10.org/publications/ai-environmental-public-health-impacts) |
| **UCBL1** | Relevés mensuels de consommation électrique du data center de l'Université Claude Bernard Lyon 1 | Données internes |
| **IEEE Dataport (Portugal)** | Dataset de consommation énergétique d'un serveur au Portugal | [IEEE Dataport - Server Energy Dataset](https://ieee-dataport.org/open-access/data-server-energy-consumption-dataset) |
| **Boavizta API** | Données d'impact environnemental pour l'estimation des émissions des terminaux | [Boavizta API](https://boavizta.github.io/boaviztapi/) |
| **IEA** | Données sur la consommation énergétique des entreprises technologiques | [IEA - Data Centres and Networks](https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks) |
| **World Atlas (TopoJSON)** | Données géographiques pour la carte mondiale des régions cloud | [World Atlas](https://github.com/topojson/world-atlas) |

## Travaux importants liés au projet

### 1. [Scaphandre (Hubblo)](https://github.com/hubblo-org/scaphandre)
* **Ce qu'il fait :** Agent de métrologie capable de remonter la consommation électrique au niveau des processus.
* **Limite :** Outil backend technique fournissant des données brutes (Watts) sans contexte écologique.
* **Notre apport :** Focus sur la visualisation pédagogique et l'exploration pour les décideurs.

### 2. [Datavizta (Boavizta)](https://datavizta.boavizta.org/)
* **Ce qu'il fait :** Base de référence méthodologique pour l'impact CO₂ de la fabrication et de l'usage.
* **Limite :** Approche statique basée sur des inventaires.
* **Notre apport :** Ajout de la dimension temporelle et dynamique via nos données de consommation réelle.

### 3. [Cloud Carbon Footprint](https://www.cloudcarbonfootprint.org/)
* **Ce qu'il fait :** Dashboard estimant les émissions carbone des fournisseurs cloud (AWS, Azure, GCP).
* **Limite :** Basé sur des estimations issues de la facturation (reporting mensuel).
* **Notre apport :** Visualisation comparative des régions via données CFE réelles.

### 4. [Netdata](https://www.netdata.cloud/)
* **Ce qu'il fait :** Standard industriel du monitoring d'infrastructure temps réel.
* **Limite :** Surcharge d'information (*Information Overload*) et complexité élevée.
* **Notre apport :** Interface épurée focalisée uniquement sur les métriques d'efficacité énergétique (PUE, CO₂).

### 5. [Electricity Maps](https://app.electricitymaps.com/)
* **Ce qu'il fait :** Carte en direct de l'intensité carbone (gCO₂/kWh) des réseaux électriques nationaux.
* **Limite :** Vue externe uniquement (réseau), sans lien avec la consommation interne.
* **Notre apport :** Intégration des données CFE Google pour contextualiser l'impact des régions cloud.

### 6. Littérature PUE (Power Usage Effectiveness)
* **Usage :** Indicateur standard de l'industrie (ratio énergie totale / énergie équipement IT).
* **Notre apport :** Visualisation de l'évolution historique du PUE global (Uptime Institute) et par site (Google).

## Organisation du Projet

* **Communication :** WhatsApp/Discord + GitHub Issues/PR.
* **Sessions de travail :** Hebdomadaire le samedi + travail asynchrone.

**Rôles identifiés :**
* *Data Wrangling / Pré-traitement :* Lokmane AKKOUH
* *Développement D3.js :* Toute l'équipe
* *Design :* Hamza MOTASSIM & Mohamed Rida BEN TOUHAMI
* *Suivi projet :* Mohamed AFKIR

## Structure des Données

```
data/
├── californie/              # Projections impact California (8 fichiers)
├── climatiq/               # Émissions cloud providers (4 fichiers)
├── google/                 # Historique PUE Google (1 fichier)
├── iae/                    # Données IEA (3 fichiers)
├── portugal/               # Consommation serveur Portugal (7 fichiers)
├── terminals/              # Données CPU/GPU (2 fichiers JSON)
├── ucbl1/                  # Consommation UCBL1 (18 fichiers)
├── uptime- global average/ # PUE global Uptime Institute (1 fichier)
├── yearly Carbon free energy for Google Cloud regions/ # CFE 2019-2024 (6 fichiers)
├── EfficiencyAnalysis - SpecPower Servers.csv  # 1000+ benchmarks serveurs
└── EfficiencyAnalysis - TechPowerUp SSDs.csv   # Benchmarks SSD
```

## Credits

<<<<<<< HEAD
This project uses a template provided by [themewagon](https://themewagon.com/themes/milky/). We acknowledge and thank them for their work.
=======
This project uses a template provided by [[themewagon](https://themewagon.com/themes/milky/)]. We acknowledge and thank them for their work. For more details, visit their website or repository.
## bytes2carbon

This project analyzes and visualizes the carbon footprint and energy efficiency of digital infrastructure, including servers, SSDs, cloud providers, and datacenters. It provides interactive charts and data-driven insights using D3.js and other visualization tools.

### Features
- Data analysis of energy consumption and carbon emissions
- Visualizations for trends, efficiency, and regional comparisons
- CSV datasets for various providers and regions
- Modular JS and CSS for interactive dashboards

### Structure
- `data/` — CSVs and scripts for energy, emissions, and efficiency
- `js/` — Visualization and dashboard scripts
- `css/` — Stylesheets for UI and charts
- `vizpages/` — HTML pages for visualizations

### Usage
To use the project:

1. Clone or download the repository to your local machine.
2. Open `index.html` in your browser to view the main dashboard.
3. For specific visualizations, open any HTML file in the `vizpages/` folder.
4. Data sources are available in the `data/` folder for further analysis or customization.

No installation is required; all visualizations run in the browser. For custom data, replace or add CSV files in the `data/` directory.
>>>>>>> dev
