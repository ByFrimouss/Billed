//////////////////////////////////////////////////
//////////////// PAGE DE CONNEXION //////////////
/////////////////////////////////////////////////

/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

// 💡 Mock complet pour tous les tests Login
const mockStore = {
  login: jest.fn(() => Promise.resolve({ jwt: "12345" })), // 👈 renvoie `jwt` comme attendu
  users: jest.fn(() => ({
    create: jest.fn(() => Promise.resolve({})),
  })),
};

//////////////////////// EMPLOYEE /////////////////////

/////////////////////////////////////////////////////////
///// Champs vides => reste sur Login ///////
/////////////////////////////////////////////////////////

// Quand je ne remplis pas les champs et que je clique sur le bouton de connexion employé
describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    // Alors la page de connexion doit s’afficher
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  /////////////////////////////////////////////////////////
  ///// Email incorrect => reste sur Login ////
  /////////////////////////////////////////////////////////

  // Quand je remplis les champs avec un format incorrect et que je clique sur le bouton de connexion employé
  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  ///////////////////////////////////////////////////////////////////////
  ///// Connexion valide => accès Tableau de bord ////////
  //////////////////////////////////////////////////////////////////////

  // Quand je remplis correctement les champs et que je clique sur le bouton de connexion employé
  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    // Alors je devrais être identifié comme un employé dans l’application
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      // localStorage devrait être rempli avec les données du formulaire
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      // nous devons simuler la navigation pour la tester
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store: mockStore,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    // La page des notes de frais doit s’afficher
    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

//////////////////////// ADMINISTRATEUR /////////////////////

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      // localStorage devrait être rempli avec les données du formulaire
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      // nous devons simuler la navigation pour la tester
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store: mockStore,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    // La page du tableau de bord RH doit s’afficher
    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});

////////////////// TESTS ADDITIONNELS //////////////////////

////////////////////////////////////////////////////////////
///// Erreur API lors du login employé ////////
////////////////////////////////////////////////////////////

describe("Additional tests for Login.js coverage", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-testid="form-employee">
        <input data-testid="employee-email-input">
        <input data-testid="employee-password-input">
      </form>
    `;
  });

  describe("Additional tests for Login.js coverage", () => {
    test("login() rejette une erreur quand l'API échoue", async () => {
      const store = {
        login: jest.fn().mockRejectedValue(new Error("API error")),
      };

      const onNavigate = jest.fn();
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: "",
        store,
      });

      const user = { email: "test@test.com", password: "wrong" };

      // le test vérifie uniquement le rejet, pas le console.error
      await expect(login.login(user)).rejects.toThrow("API error");
      expect(store.login).toHaveBeenCalledWith(JSON.stringify(user));
    });
  });
});

////////////////////////////////////////////////////////////
///// Aucun store => login() retourne null /////
////////////////////////////////////////////////////////////

// Store undefined
test("login() retourne null quand store est undefined", async () => {
  document.body.innerHTML = LoginUI();

  const login = new Login({
    document,
    localStorage: window.localStorage,
    store: undefined,
  });

  const result = await login.login({
    email: "test@email.com",
    password: "1234",
  });

  expect(result).toBeNull();
});

/////////////////////////////////////////////////////////////
///// Soumission Login employé complète ////////
/////////////////////////////////////////////////////////////

// Soumission formulaire employé
test("handleSubmitEmployee appelle store.login() et onNavigate", async () => {
  // Mock window.localStorage AVANT d'instancier Login
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  document.body.innerHTML = LoginUI();

  const mockNavigate = jest.fn();

  const login = new Login({
    document,
    localStorage: window.localStorage,
    store: {
      login: jest.fn(() => Promise.resolve({ jwt: "12345" })),
      users: jest.fn(() => ({ create: jest.fn(() => Promise.resolve({})) })),
    },
    onNavigate: mockNavigate,
  });

  // remplir les champs
  fireEvent.change(screen.getByTestId("employee-email-input"), {
    target: { value: "employee@test.tld" },
  });
  fireEvent.change(screen.getByTestId("employee-password-input"), {
    target: { value: "1234" },
  });

  // soumettre le formulaire
  const form = screen.getByTestId("form-employee");
  fireEvent.submit(form);

  // attendre que toutes les promesses microtasks soient résolues
  await waitFor(() => {
    expect(login.store.login).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("#employee/bills");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@test.tld",
        password: "1234",
        status: "connected",
      })
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith("jwt", "12345");
  });
});
