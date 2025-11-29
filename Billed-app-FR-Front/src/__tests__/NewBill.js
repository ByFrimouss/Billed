//////////////////////////////////////////////////
///////////////// CRÉATION D'UNE /////////////////
///////////// NOUVELLE NOTE DE FRAIS ////////////
/////////////////////////////////////////////////

/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

//---------------------------------------------
// Vérifie que le formulaire de nouvelle
// note de frais s'affiche correctement
//---------------------------------------------

// Étant donné que je suis connecté en tant qu’employé
describe("Given I am connected as an employee", () => {
  // Quand je suis sur la page de création d’une nouvelle note de frais
  describe("When I am on NewBill Page", () => {
    // Alors le formulaire devrait être affiché
    test("Then the form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      //à faire écrire l'assertion

      // Récupère le formulaire dans le DOM via son testId
      const form = screen.getByTestId("form-new-bill");

      // Vérifie que le formulaire est bien présent
      expect(form).toBeTruthy();
    });
  });
});

//---------------------------------------------
// Vérifie qu'un fichier invalide déclenche un message d'erreur
//---------------------------------------------

// Alors télécharger un fichier avec une extension invalide devrait afficher un message d'erreur
test("Then uploading a file with an invalid extension should show an error message", async () => {
  const html = NewBillUI();
  document.body.innerHTML = html;

  const onNavigate = jest.fn();
  const newBill = new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });

  // Simulation d’un fichier PDF (non autorisé)
  const fileInput = screen.getByTestId("file");
  const invalidFile = new File(["(⌐□_□)"], "document.pdf", {
    type: "application/pdf",
  });

  fireEvent.change(fileInput, { target: { files: [invalidFile] } });

  // Vérifie que le champ est vidé et qu’un message d’erreur s’affiche
  const errorMessage = screen.getByTestId("file-error");
  expect(fileInput.value).toBe(""); // le champ a été réinitialisé
  expect(errorMessage.textContent).toBe(
    "Seuls les formats de fichier jpg, jpeg et png sont valides."
  );
});

//---------------------------------------------
// Vérifie qu'un fichier valide met à jour
// les attributs fileUrl et fileName
//---------------------------------------------

// Alors le téléchargement d'un fichier valide devrait mettre à jour fileUrl et fileName
test("Then uploading a valid file should update fileUrl and fileName", async () => {
  document.body.innerHTML = NewBillUI();

  // Mock du localStorage
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({ type: "Employee", email: "a@a" })
  );

  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
  };

  const newBill = new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });

  // Simulation du fichier valide
  const fileInput = screen.getByTestId("file");
  const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
  fileInput.addEventListener("change", handleChangeFile);

  const validFile = new File(["image"], "test.png", { type: "image/png" });
  fireEvent.change(fileInput, { target: { files: [validFile] } });

  // Vérifie que la fonction handleChangeFile a été appelée
  expect(handleChangeFile).toHaveBeenCalled();

  // Vérifie que fileUrl et fileName ont été définis après l'upload
  await waitFor(() => expect(newBill.fileUrl).toBeDefined());
  expect(newBill.fileName).toBe("test.png");
});

//---------------------------------------------
// Test d'intégration POST new bill
//---------------------------------------------

// Teste la soumission complète du formulaire et la communication avec le store

// Étant donné que je suis connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  // Quand je soumets le formulaire de nouvelle note de frais
  describe("When I submit a new bill form", () => {
    let newBillContainer;
    let onNavigate;

    beforeEach(() => {
      // Rendu de l'UI et initialisation du localStorage
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      // Fonction de navigation simulée
      onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });

      // Instanciation du container NewBill
      newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    // --- TEST POST OK ---
    test("Then submitting the form calls store.bills().update and navigates to Bills page", async () => {
      const form = screen.getByTestId("form-new-bill");

      // Simuler l'upload d'un fichier valide avant la soumission
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["img"], "test.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Attendre que handleChangeFile définisse fileUrl et billId
      await waitFor(() => expect(newBillContainer.fileUrl).toBeDefined());
      expect(newBillContainer.billId).toBeDefined();

      // Remplir les champs
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Taxi" },
      });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: 50 } });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2025-10-19" },
      });

      // Spy sur la méthode update du store pour vérifier qu'elle est appelée
      const spyUpdate = jest.spyOn(mockStore.bills(), "update");

      // Soumission du formulaire
      fireEvent.submit(form);

      await waitFor(() => {
        expect(spyUpdate).toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });

    // --- TEST POST 404 ---
    test("Then API POST returning 404 should throw an error", async () => {
      // Simule un store rejetant la requête
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => ({
        create: () => Promise.reject(new Error("Erreur 404")),
        update: () => Promise.reject(new Error("Erreur 404")),
      }));

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Vérifie que l'erreur s'affiche dans le DOM
      await waitFor(() => expect(screen.getByText("Erreur 404")).toBeTruthy());
    });

    // --- TEST POST 500 ---
    test("Then API POST returning 500 should throw an error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => ({
        create: () => Promise.reject(new Error("Erreur 500")),
        update: () => Promise.reject(new Error("Erreur 500")),
      }));

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      await waitFor(() => expect(screen.getByText("Erreur 500")).toBeTruthy());
    });
  });
});
