//////////////////////////////////////////////////
/////////// TABLEAU DE BORD EMPLOYEE ////////////
//////////////////////////////////////////////////

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

////////////////////////////////////
// TESTS UNITAIRES POUR VIEWS/BILLS
////////////////////////////////////

// Étant donné que je suis connecté en tant qu’employé
describe("Given I am connected as an employee", () => {
  // Quand je suis sur la page Bills
  describe("When I am on Bills Page", () => {
    // Alors l’icône des factures dans la barre latérale verticale doit être surlignée
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      // Vérifie que la classe "active-icon" est bien appliquée
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    /////////////////////// SCÉNARIO 4 /////////////////////
    // Alors les factures doivent être triées de la plus récente à la plus ancienne
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

////////////////////////////////////
// TESTS UNITAIRES POUR CONTAINER/BILLS
////////////////////////////////////

describe("Given I am connected as Employee", () => {
  let billsContainer;

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );

    // Simule les éléments du DOM nécessaires
    document.body.innerHTML = `
      <button data-testid="btn-new-bill"></button>
      <div data-testid="icon-eye" data-bill-url="http://example.com/bill.jpg"></div>
      <div id="modaleFile"><div class="modal-body"></div></div>
    `;

    // Mock de jQuery modal
    $.fn.modal = jest.fn();

    billsContainer = new Bills({
      document,
      onNavigate: (pathname) => {
        window.location.hash = pathname;
      },
      store: mockStore,
      localStorage: localStorageMock,
    });
  });

  // TEST handleClickNewBill : Vérifie la navigation
  test("handleClickNewBill navigates to NewBill page", () => {
    billsContainer.handleClickNewBill();
    expect(window.location.hash).toBe("#employee/bill/new");
  });

  // TEST handleClickIconEye : Vérifie que la modal contient l'image
  test("handleClickIconEye shows modal with bill image", () => {
    const icon = screen.getByTestId("icon-eye");
    billsContainer.handleClickIconEye(icon);

    const modalBody = document.querySelector("#modaleFile .modal-body");
    expect(modalBody.innerHTML).toContain("img");
    expect(modalBody.innerHTML).toContain("http://example.com/bill.jpg");
  });

  // TEST GET Bills - intégration avec mock API
  describe("When I call getBills", () => {
    test("fetches bills from mock API GET", async () => {
      const data = await billsContainer.getBills();

      // Vérifie que les bills sont bien récupérées
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("date");
      expect(data[0]).toHaveProperty("status");
    });

    // TEST erreurs API
    test("fetch fails with 404 message error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return { list: () => Promise.reject(new Error("Erreur 404")) };
      });
      try {
        await billsContainer.getBills();
      } catch (e) {
        expect(e.message).toBe("Erreur 404");
      }
    });

    test("fetch fails with 500 message error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return { list: () => Promise.reject(new Error("Erreur 500")) };
      });
      try {
        await billsContainer.getBills();
      } catch (e) {
        expect(e.message).toBe("Erreur 500");
      }
    });
  });
});
