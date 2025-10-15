//////////////////////////////////////////////////
///////////////// CRÉATION D'UNE /////////////////
///////////// NOUVELLE NOTE DE FRAIS ////////////
/////////////////////////////////////////////////

/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

// Étant donné que je suis connecté en tant qu’employé
describe("Given I am connected as an employee", () => {
  // Quand je suis sur la page de création d’une nouvelle note de frais
  describe("When I am on NewBill Page", () => {
    // Alors ...
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      //à faire écrire l'assertion
    })
  })
})
