import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.localStorage = localStorage;

    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);

    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);

    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;

    new Logout({ document, localStorage, onNavigate });
  }

  //////////////////////// EXTENSION AUTORISÉES JPG, JPEG, PNG /////////////////////

  // Méthode appelée du champ <input type="file">
  handleChangeFile = (e) => {
    e.preventDefault();
    // Empêche tout comportement inattendu de l'événement

    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];

    const filePath = file ? file.name.split(/\\/g) : "";
    // Sépare le nom complet du fichier en segments si jamais un chemin complet est fourni
    // Ex : "C:\fakepath\image.png" deviendra ["C:", "fakepath", "image.png"]

    const fileName = filePath[filePath.length - 1] || "";
    // Récupère le dernier segment du tableau (le vrai nom du fichier, ex: "image.png")
    // Si jamais filePath est vide, retourne une chaîne vide par sécurité

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = fileName.split(".").pop().toLowerCase();
    // Extrait l’extension du fichier
    // `.pop()` retourne la dernière partie après le split, ex : "png" pour "image.png"

    const errorElement = this.document.querySelector(
      '[data-testid="file-error"]'
    );
    // Sélectionne dans le DOM l’élément prévu pour afficher un message d’erreur

    if (!allowedExtensions.includes(fileExtension)) {
      // Si l’extension du fichier n’est pas dans la liste autorisée
      fileInput.value = "";
      // Réinitialise le champ file pour effacer le fichier sélectionné
      if (errorElement)
        errorElement.textContent =
          "Seuls les formats de fichier jpg, jpeg et png sont valides.";
      // Si un élément d’erreur existe dans le DOM, affiche un message explicite
      errorElement.style.display = "block";
      return;
      // Stoppe la fonction
    }

    // Si le fichier est valide, vide le message d’erreur
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }

    this.fileName = fileName;
    this.file = file;
    // Sauvegarde le nom du fichier sélectionné et l’objet File lui-même

    const formData = new FormData();
    // Crée un objet FormData pour envoyer des données de type "multipart/form-data"

    const email = JSON.parse(this.localStorage.getItem("user")).email;
    // Récupère l’adresse e-mail de l’utilisateur connecté depuis le localStorage

    formData.append("file", file);
    formData.append("email", email);
    // Ajoute le fichier et l’e-mail dans le FormData, pour l’API

    if (this.store) {
      // Je vérifie que le store existe
      this.store
        .bills()
        .create({
          data: formData,
          headers: { noContentType: true },
        })
        .then(({ fileUrl, key }) => {
          // Si la requête réussit, je récupère :
          // - `fileUrl` : le lien du fichier
          // - `key` : l’identifiant unique du ticket
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
          // Sauvegarde les informations
        })
        .catch((error) => console.error(error));
      // Si une erreur survient pendant l’upload, cela s'affiche dans la console
    }
  };

  //////////////////////// SOUMISSION DU FORMULAIRE /////////////////////

  handleSubmit = (e) => {
    e.preventDefault();

    const email = JSON.parse(localStorage.getItem("user")).email;

    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };

    // not need to cover this function by tests
    // pas besoin de couvrir cette fonction par des tests

    // Gère la navigation et les erreurs dans le then/catch
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          // Navigation après confirmation que la mise à jour est réussie
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => {
          // Injecte l'erreur dans le DOM pour que les tests d'intégration détectent l'erreur
          const errorDiv = document.createElement("div");
          errorDiv.textContent = error.message;
          document.body.appendChild(errorDiv);
          console.error(error);
          console.log(errorDiv);
        });
    }
  };
}
