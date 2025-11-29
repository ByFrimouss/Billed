import store from "./Store.js";
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js";
import Bills from "../containers/Bills.js";
import NewBill from "../containers/NewBill.js";
import Dashboard from "../containers/Dashboard.js";

import BillsUI from "../views/BillsUI.js";
import DashboardUI from "../views/DashboardUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

export default () => {
  const rootDiv = document.getElementById("root");
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });

  window.onNavigate = (pathname) => {
    window.history.pushState({}, pathname, window.location.origin + pathname);
    if (pathname === ROUTES_PATH["Login"]) {
      rootDiv.innerHTML = ROUTES({ pathname });
      document.body.style.backgroundColor = "#0E5AE5";
      new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
    } else if (pathname === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.add("active-icon");
      divIcon2.classList.remove("active-icon");
      const bills = new Bills({ document, onNavigate, store, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          const divIcon1 = document.getElementById("layout-icon1");
          const divIcon2 = document.getElementById("layout-icon2");
          divIcon1.classList.add("active-icon");
          divIcon2.classList.remove("active-icon");
          new Bills({ document, onNavigate, store, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    } else if (pathname === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      new NewBill({ document, onNavigate, store, localStorage });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.remove("active-icon");
      divIcon2.classList.add("active-icon");
    } else if (pathname === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      const bills = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });
    }
  };

  // Intercepte l'appui sur la flèche "back" du navigateur
  window.onpopstate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userType = user?.type;
    const pathname = window.location.pathname;

    // Si pas connecté → on revient toujours à Login
    if (!user) {
      return onNavigate(ROUTES_PATH.Login);
    }

    // --- ADMIN : toujours rester sur Dashboard ---
    // (on ignore toute tentative de back vers une autre page)
    if (userType === "Admin") {
      // recharge la vue Dashboard — garde l'utilisateur sur cette page
      return onNavigate(ROUTES_PATH.Dashboard);
    }

    // --- EMPLOYEE : règles spécifiques ---
    // Permet : NewBill -> (back) -> Bills (Dashboard)
    // Empêche : quitter l'app en pressant back depuis Bills (on reste sur Bills)
    if (userType === "Employee") {
      // Si le nouvel emplacement est explicitement Bills ou NewBill, on navigue.
      // Sinon (ex: le navigateur voudrait revenir à '/'), on force Bills.
      if (pathname === ROUTES_PATH.NewBill) {
        return onNavigate(ROUTES_PATH.NewBill);
      }
      if (pathname === ROUTES_PATH.Bills) {
        return onNavigate(ROUTES_PATH.Bills);
      }

      // Par défaut (si l'historique voudrait nous sortir de l'app), rester sur Bills
      return onNavigate(ROUTES_PATH.Bills);
    }

    // Sécurité : fallback — rester sur Bills pour éviter de quitter l'app
    return onNavigate(ROUTES_PATH.Bills);
  };

  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store });
    document.body.style.backgroundColor = "#0E5AE5";
  } else if (window.location.hash !== "") {
    if (window.location.hash === ROUTES_PATH["Bills"]) {
      rootDiv.innerHTML = ROUTES({
        pathname: window.location.hash,
        loading: true,
      });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.add("active-icon");
      divIcon2.classList.remove("active-icon");
      const bills = new Bills({ document, onNavigate, store, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          const divIcon1 = document.getElementById("layout-icon1");
          const divIcon2 = document.getElementById("layout-icon2");
          divIcon1.classList.add("active-icon");
          divIcon2.classList.remove("active-icon");
          new Bills({ document, onNavigate, store, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
        });
    } else if (window.location.hash === ROUTES_PATH["NewBill"]) {
      rootDiv.innerHTML = ROUTES({
        pathname: window.location.hash,
        loading: true,
      });
      new NewBill({ document, onNavigate, store, localStorage });
      const divIcon1 = document.getElementById("layout-icon1");
      const divIcon2 = document.getElementById("layout-icon2");
      divIcon1.classList.remove("active-icon");
      divIcon2.classList.add("active-icon");
    } else if (window.location.hash === ROUTES_PATH["Dashboard"]) {
      rootDiv.innerHTML = ROUTES({
        pathname: window.location.hash,
        loading: true,
      });
      const bills = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });
      bills
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
        });
    }
  }

  return null;
};
