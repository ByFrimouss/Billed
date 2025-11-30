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

  // ---- Utilitaire : sécurise la gestion des icônes ----
  const updateLayoutIcons = ({
    icon1Active = false,
    icon2Active = false,
  } = {}) => {
    const icon1 = document.getElementById("layout-icon1");
    const icon2 = document.getElementById("layout-icon2");

    if (!icon1 || !icon2) return;

    icon1.classList.toggle("active-icon", icon1Active);
    icon2.classList.toggle("active-icon", icon2Active);
  };

  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });

  window.onNavigate = (pathname) => {
    window.history.pushState({}, pathname, window.location.origin + pathname);

    // --- LOGIN ---
    if (pathname === ROUTES_PATH.Login) {
      rootDiv.innerHTML = ROUTES({ pathname });
      document.body.style.backgroundColor = "#0E5AE5";
      updateLayoutIcons();
      new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
      return;
    }

    // --- BILLS ---
    if (pathname === ROUTES_PATH.Bills) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      updateLayoutIcons({ icon1Active: true, icon2Active: false });

      const bills = new Bills({ document, onNavigate, store, localStorage });

      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          updateLayoutIcons({ icon1Active: true, icon2Active: false });
          new Bills({ document, onNavigate, store, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });

      return;
    }

    // --- NEW BILL ---
    if (pathname === ROUTES_PATH.NewBill) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      updateLayoutIcons({ icon1Active: false, icon2Active: true });
      new NewBill({ document, onNavigate, store, localStorage });
      return;
    }

    // --- DASHBOARD (ADMIN) ---
    if (pathname === ROUTES_PATH.Dashboard) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true });
      updateLayoutIcons({ icon1Active: true, icon2Active: true });

      const dashboard = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });

      dashboard
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          updateLayoutIcons({ icon1Active: true, icon2Active: true });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname, error });
        });

      return;
    }
  };

  // ---- BACK BUTTON (popstate) ----
  window.onpopstate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const pathname = window.location.pathname;

    if (!user) {
      return onNavigate(ROUTES_PATH.Login);
    }

    if (user.type === "Admin") {
      return onNavigate(ROUTES_PATH.Dashboard);
    }

    if (user.type === "Employee") {
      if (pathname === ROUTES_PATH.NewBill)
        return onNavigate(ROUTES_PATH.NewBill);
      return onNavigate(ROUTES_PATH.Bills);
    }

    return onNavigate(ROUTES_PATH.Bills);
  };

  // ---- PREMIER RENDU (page actuelle) ----
  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store });
    document.body.style.backgroundColor = "#0E5AE5";
  } else if (window.location.hash !== "") {
    const hash = window.location.hash;

    if (hash === ROUTES_PATH.Bills) {
      rootDiv.innerHTML = ROUTES({ pathname: hash, loading: true });
      updateLayoutIcons({ icon1Active: true, icon2Active: false });

      const bills = new Bills({ document, onNavigate, store, localStorage });
      bills
        .getBills()
        .then((data) => {
          rootDiv.innerHTML = BillsUI({ data });
          updateLayoutIcons({ icon1Active: true, icon2Active: false });
          new Bills({ document, onNavigate, store, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: hash, error });
        });
    } else if (hash === ROUTES_PATH.NewBill) {
      rootDiv.innerHTML = ROUTES({ pathname: hash, loading: true });
      updateLayoutIcons({ icon1Active: false, icon2Active: true });
      new NewBill({ document, onNavigate, store, localStorage });
    } else if (hash === ROUTES_PATH.Dashboard) {
      rootDiv.innerHTML = ROUTES({ pathname: hash, loading: true });
      updateLayoutIcons({ icon1Active: true, icon2Active: true });

      const dashboard = new Dashboard({
        document,
        onNavigate,
        store,
        bills: [],
        localStorage,
      });

      dashboard
        .getBillsAllUsers()
        .then((bills) => {
          rootDiv.innerHTML = DashboardUI({ data: { bills } });
          updateLayoutIcons({ icon1Active: true, icon2Active: true });
          new Dashboard({ document, onNavigate, store, bills, localStorage });
        })
        .catch((error) => {
          rootDiv.innerHTML = ROUTES({ pathname: hash, error });
        });
    }
  }

  return null;
};
