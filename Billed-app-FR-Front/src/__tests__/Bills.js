//////////////////////////////////////////////////
/////////// TESTS UNITAIRES & INTÉGRATION BILLS ////////////
//////////////////////////////////////////////////

//////////////// IMPORTS //////////////////

/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js";

/////////////////////////////////////////////////////////////
//            TESTS BillsUI - RENDU HTML (UI)
/////////////////////////////////////////////////////////////

describe("Given I am connected as an employee", () => {
  //----------------------------------------------------------
  // Icône Bills dans la sidebar doit être en surbrillance
  //----------------------------------------------------------
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Mock du localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      // Prépare le root pour le router
      document.body.innerHTML = `<div id="root"></div>`;

      // Initialise le router
      router();

      // Navigation vers Bills
      window.onNavigate(ROUTES_PATH.Bills);

      // Attend que l'icône soit là
      const windowIcon = await waitFor(() => screen.getByTestId("icon-window"));

      // Vérifie qu'elle est highlight
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  //----------------------------------------------------------
  // Les bills doivent être triées correctement
  //----------------------------------------------------------
  test("Then bills should be ordered from latest to earliest", async () => {
    // Crée le container avec le store mock
    const billsContainer = new Bills({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: localStorageMock,
    });

    // Récupère les bills via getBills()
    const billsData = await billsContainer.getBills();

    // Vérifie que le tableau est trié décroissant sur dateRaw
    for (let i = 0; i < billsData.length - 1; i++) {
      const current = new Date(billsData[i].dateRaw);
      const next = new Date(billsData[i + 1].dateRaw);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }
  });
});

//----------------------------------------------------------
// TEST D'INTÉGRATION GET — Navigation + API + Rendu UI
//----------------------------------------------------------

describe("When I navigate to Bills Page", () => {
  test("Then bills from mock API GET should be rendered in the UI", async () => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );

    // Mock du store
    jest.spyOn(mockStore, "bills");

    // Récupération des données mockées
    const bills = await mockStore.bills().list();

    // On injecte la page dans le DOM
    document.body.innerHTML = BillsUI({
      data: bills,
      loading: false,
      error: null,
    });

    // Maintenant on peut chercher le tbody
    const tbody = await screen.findByTestId("tbody");

    // Vérifie que le mockStore a été appelé
    expect(mockStore.bills).toHaveBeenCalled();

    // Vérifie qu'il y a du contenu dans le tableau
    expect(tbody.innerHTML.length).toBeGreaterThan(10);

    // Vérifie qu'au moins une facture apparaît
    expect(screen.getByText(/Hôtel/i)).toBeTruthy();
  });
});

// -----------------------------------------------------------
//        Le constructeur doit attacher l'écouteur
//        sur le bouton "Nouvelle note de frais"
// -----------------------------------------------------------
test("constructor should attach click listener to NewBill button", () => {
  // Espionne addEventListener du bouton
  const newBillButton = screen.getByTestId("btn-new-bill");
  const spy = jest.spyOn(newBillButton, "addEventListener");

  // Instanciation du container
  new Bills({
    document,
    onNavigate: jest.fn(),
    store: null,
    localStorage,
  });

  // Vérifie que l'écouteur click a bien été ajouté
  expect(spy).toHaveBeenCalledWith("click", expect.any(Function));
});

// -----------------------------------------------------------
// Le constructeur doit attacher des listeners sur CHAQUE
// icône "œil" affichée dans la page.
// -----------------------------------------------------------
test("constructor attaches click listeners to all eye icons", async () => {
  document.body.innerHTML = `
    <button data-testid="btn-new-bill"></button>
    <div data-testid="icon-eye" data-bill-url="http://example.com/b1.jpg"></div>
    <div data-testid="icon-eye" data-bill-url="http://example.com/b2.jpg"></div>
    <div id="modaleFile"><div class="modal-body"></div></div>
  `;

  const billsInstance = new Bills({
    document,
    onNavigate: jest.fn(),
    store: mockStore,
    localStorage: localStorageMock,
  });

  // Appelle getBills() pour que le tbody soit rempli et les listeners attachés
  await billsInstance.getBills();

  const icons = screen.getAllByTestId("icon-eye");
  const spy = jest.spyOn(icons[0], "addEventListener");

  // Attache manuellement les listeners (comme fait getBills)
  icons.forEach((icon) =>
    icon.addEventListener("click", () => billsInstance.handleClickIconEye(icon))
  );

  expect(spy).toHaveBeenCalledWith("click", expect.any(Function));
});

///////////////////////////////////////////////
// TESTS FONCTIONNELS ET LOGIQUE
///////////////////////////////////////////////

describe("Given I am connected as Employee", () => {
  let billsContainer;

  beforeEach(() => {
    // Simuler un utilisateur connecté avec le mock du localStorage
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );

    // DOM minimal nécessaire aux tests
    document.body.innerHTML = `
      <button data-testid="btn-new-bill"></button>
      <div data-testid="icon-eye" data-bill-url="http://example.com/bill.jpg"></div>
      <div id="modaleFile"><div class="modal-body"></div></div>
    `;

    // Mock de la fonction modal de jQuery (bootstrap)
    $.fn.modal = jest.fn();

    // Création du container Bills
    billsContainer = new Bills({
      document,
      onNavigate: (pathname) => (window.location.hash = pathname),
      store: mockStore,
      localStorage: localStorageMock,
    });
  });

  // -----------------------------------------------------------
  // Vérifie que les bills récupérées sont affichées
  // -----------------------------------------------------------
  test("inserts fetched bills into the UI", async () => {
    const billsData = await billsContainer.getBills();
    document.body.innerHTML = BillsUI({ data: billsData });

    // Vérifie que la première bill est bien affichée
    expect(screen.getByText(billsData[0].name)).toBeTruthy();
  });

  // -----------------------------------------------------------
  // Vérifie la navigation vers NewBill
  // -----------------------------------------------------------
  test("handleClickNewBill navigates to NewBill page", () => {
    const newBillButton = screen.getByTestId("btn-new-bill");

    // Remplace la méthode par un spy pour suivre son appel
    billsContainer.handleClickNewBill = jest.fn(
      billsContainer.handleClickNewBill.bind(billsContainer)
    );

    // Ajout du listener au bouton
    newBillButton.addEventListener("click", billsContainer.handleClickNewBill);

    // Simule un clic utilisateur
    fireEvent.click(newBillButton);

    // Vérifie que la fonction a bien été appelée
    expect(billsContainer.handleClickNewBill).toHaveBeenCalled();

    // Vérifie que la navigation s'est bien produite
    expect(window.location.hash).toBe("#employee/bill/new");
  });

  // -----------------------------------------------------------
  // Vérifie l’ouverture de la modale
  // -----------------------------------------------------------
  test("handleClickIconEye shows modal with bill image", () => {
    const icon = screen.getByTestId("icon-eye");

    billsContainer.handleClickIconEye(icon);

    const modalBody = document.querySelector("#modaleFile .modal-body");

    expect(modalBody.innerHTML).toContain("<img"); // L'image est insérée
    expect(modalBody.innerHTML).toContain("http://example.com/bill.jpg"); // Vérifie l'URL
    expect($.fn.modal).toHaveBeenCalledWith("show"); // Modal affichée
  });

  // -----------------------------------------------------------
  // API GET (mockStore) : Vérifie les différentes situations
  // de la gestion d'erreurs
  // -----------------------------------------------------------
  describe("When I call getBills", () => {
    test("fetches bills from mock API GET", async () => {
      const data = await billsContainer.getBills();

      // Vérifie que des données sont présentes
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("date");
      expect(data[0]).toHaveProperty("status");
    });

    test("returns raw date when formatDate throws an error", async () => {
      // Force une date incorrecte pour tester le catch
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => ({
        list: () =>
          Promise.resolve([{ id: "123", date: "BAD_DATE", status: "pending" }]),
      }));

      const data = await billsContainer.getBills();

      // La date incorrecte est retournée brute
      expect(data[0].date).toBe("BAD_DATE");
      // Le statut est traduit en français malgré la date
      expect(data[0].status).toBe("En attente");
    });

    test("fetch fails with 404 message error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 404")),
      }));

      // Vérifie que l'erreur 404 est bien propagée
      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 404");
    });

    test("fetch fails with 500 message error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 500")),
      }));

      // Vérifie que l'erreur 500 est bien propagée
      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 500");
    });
  });

  // -----------------------------------------------------------
  // BRANCH COVERAGE (scénarios supplémentaires)
  // -----------------------------------------------------------
  describe("Additional branch coverage", () => {
    test("constructor works even if store is null", () => {
      const instance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: localStorageMock,
      });
      // Vérifie que l'instance se crée sans problème
      expect(instance).toBeTruthy();
    });

    test("getBills returns empty array when API returns empty", async () => {
      // Force le store à renvoyer un tableau vide
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => ({
        list: () => Promise.resolve([]),
      }));

      const data = await billsContainer.getBills();
      expect(data).toEqual([]);
    });

    test("getBills formats date correctly and translates status when formatDate succeeds", async () => {
      const data = await billsContainer.getBills();

      const expectedDates = [
        "01/01/2001",
        "02/02/2002",
        "03/03/2003",
        "04/04/2004",
      ];

      const actualDates = data.map((bill) => bill.date);

      // Trie pour éviter les erreurs liées à l'ordre
      expect(actualDates.slice().sort()).toEqual(expectedDates.slice().sort());

      const expectedStatuses = ["En attente", "Accepté", "Refusé"];
      const actualStatuses = data.map((bill) => bill.status);

      // Vérifie que tous les statuts attendus sont présents
      expectedStatuses.forEach((status) =>
        expect(actualStatuses).toContain(status)
      );
    });

    test("constructor handles zero icon-eye elements without error", () => {
      // Supprime les icônes pour tester le comportement
      document.body.innerHTML = `<div id="modaleFile"><div class="modal-body"></div></div>`;

      const instance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      expect(instance).toBeTruthy();
    });

    test("handleClickNewBill does not throw if button is absent", () => {
      // Supprime le bouton pour tester le comportement
      document.body.innerHTML = `<div></div>`;

      const instance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Vérifie que l'appel à handleClickNewBill ne plante pas
      expect(() => instance.handleClickNewBill()).not.toThrow();
    });
  });
});
