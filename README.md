# Billed - Feature "Note de frais"

Projet de finalisation de la fonctionnalité **note de frais** de l’application SaaS **Billed**, destinée aux équipes RH.
Objectif : tester, débugger et fiabiliser le parcours employé et administrateur avant mise en production.

---

## Fonctionnalités

### Employé

* Connexion depuis la page Login.
* Consultation de ses notes de frais (statut + justificatifs téléchargeables).
* Création et envoi d’une nouvelle note de frais (type, montant, date, justificatif...).
* Déconnexion (retour à la page Login).

### Administrateur RH

* Dashboard listant toutes les notes de frais (en attente, acceptées, refusées).
* Validation ou refus d’une note en attente.
* Consultation des justificatifs et détails de toutes les notes.
* Déconnexion (retour à la page Login).

---

## Installation

### Backend

```bash
git clone <url-backend>
cd backend
npm install
npm start
```

### Frontend

```bash
git clone <url-frontend>
cd frontend
npm install
npm start
```

---

## Missions réalisées

* Débogage du parcours **employé**.
* Débogage du parcours **administrateur**.
* Mise en place de **tests unitaires et End-to-End**.
* Correction des bugs recensés dans le Kanban.

---

## État d’avancement

* Backend → **prêt en version alpha**.
* Frontend →

  * Admin : testé, en phase de debugging.
  * Employé : à tester et corriger (priorité).

---

## Deadline

La feature doit être prête pour **présentation en démo interne et lancement officiel**.

---

## Contacts

* Lead Developer : Matthieu @Billed
* Feature Team : “Note de frais”

---

> Projet réalisé dans le cadre d’un entraînement au **testing front-end (JavaScript / Jest / Chrome Debugger)**.

