//////////////////////////////////////////////////
///////////////// CRÉATION D'UNE /////////////////
///////////// NOUVELLE NOTE DE FRAIS ////////////
/////////////////////////////////////////////////

/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes.js"
import router from "../app/Router.js"

//////////////////////// SCÉNARIO 5 /////////////////////
// Étant donné que je suis connecté en tant qu’employé
describe("Given I am connected as an employee", () => {
  // Quand je suis sur la page de création d’une nouvelle note de frais
  describe("When I am on NewBill Page", () => {
    // Alors le formulaire devrait être affiché
    test("Then the form should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      //à faire écrire l'assertion

      const form = screen.getByTestId("form-new-bill")
  expect(form).toBeTruthy()
    })
  })
})
debugger
//////////////////////// SCÉNARIO 7 /////////////////////
// Alors télécharger un fichier avec une extension invalide devrait afficher un message d'erreur
    test("Then uploading a file with an invalid extension should show an error message", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // Simulation d’un fichier PDF (non autorisé)
      const fileInput = screen.getByTestId("file")
      const invalidFile = new File(["(⌐□_□)"], "document.pdf", { type: "application/pdf" })

      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      // Vérifie que le champ est vidé et qu’un message d’erreur s’affiche
      const errorMessage = screen.getByTestId("file-error")
      expect(fileInput.value).toBe("") // le champ a été réinitialisé
      expect(errorMessage.textContent).toBe("Seuls les formats de fichier jpg, jpeg et png sont valides.")
    })

    //////////////////////// SCÉNARIO 6 /////////////////////
    // Alors le téléchargement d'un fichier valide devrait mettre à jour fileUrl et fileName
    test("Then uploading a valid file should update fileUrl and fileName", async () => {
  document.body.innerHTML = NewBillUI();

  // Mock du localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem(
    'user',
    JSON.stringify({ type: 'Employee', email: 'a@a' })
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

  expect(handleChangeFile).toHaveBeenCalled();
  await waitFor(() => expect(newBill.fileUrl).toBeDefined());
  expect(newBill.fileName).toBe("test.png");
});
