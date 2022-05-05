/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom" // fireEvent: ajouté pour les tests de vérification d'action
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"


//Rajout d'un auto Mock pour simuler automatiquement le module
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Test vérifiant si l'icône est bien en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Défini le user en tant qu'employé dans le localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Crée un noeud pour intégrer le router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Lance le router
      router() 

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Vérifie si la classe active-icon est présente
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    // Test vérifiant si les factures sont bien triées par ordre décroissant
    test("Then bills should be ordered from earliest to latest", () => {
      // Implémente les factures
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // AJOUT DES TESTS BILLS
  // Test clic sur Nouvelle note de frais
  describe("When I click on button 'Nouvelle note de frais'", () => {
    // Vérifie que la page new bill s'affiche 
    test("Then New bill Page should be displayed", () => {
      // Défini le user en tant qu'employé dans le localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Implémente les données des factures dans le DOM
      const html = BillsUI({data : bills})
      document.body.innerHTML = html
      // Récupère le pathname de l'url comme étant #employee/bills dans la variable onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }

      // Récupère les paramètres de la new bill
      const mockBills = new Bills({
        document, 
        onNavigate, 
        localStorage: window.localStorage, 
        store: null 
      });

      // Récupère btn-new-bill
      const btnNewBill = screen.getByTestId('btn-new-bill');
  
      // Simulation de la fonction handleClickNewBill
      const mockFunctionHandleClick = jest.fn(mockBills.handleClickNewBill);
      btnNewBill.addEventListener('click',mockFunctionHandleClick)
      fireEvent.click(btnNewBill)
      expect(mockFunctionHandleClick).toHaveBeenCalled();
    }) 
  })

  // Test clic sur Icon Eye
  describe("When I click on first eye icon", () => {
    // Vérifie que la modale s'affiche
    test("Then modal should open", () => {
    // Défini le user en tant qu'employé dans le localStorage
      Object.defineProperty(window, localStorage, {value: localStorageMock})
      window.localStorage.setItem("user", JSON.stringify({type: 'Employee'}))
      
      // Implémente les données des bills dans le DOM
      const html = BillsUI({data: bills})
      document.body.innerHTML = html
    
      // Récupère le pathname de l'url comme étant #employee/bills
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
       
      // Récupère les paramètres de la new bill 
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage:localStorageMock,
        store: null,
      });
    
      //Simulation de la modale (image view)
      $.fn.modal = jest.fn();
    
      //Simulation de l'icon eye
      const handleClickIconEye = jest.fn(() => {
        billsContainer.handleClickIconEye
      });

      // Attribut la valeur en index 0 dans le tableau
      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
      // l'event handleClickIconEye se lance au clic de firstEyeIcon
      firstEyeIcon.addEventListener("click", handleClickIconEye)
      // Crée un event au click et le dispatche sur le DOM
      fireEvent.click(firstEyeIcon)

      // Vérifie que l'event a été appelé
      expect(handleClickIconEye).toHaveBeenCalled();
      // Vérifie que la modale a été appelé
      expect($.fn.modal).toHaveBeenCalled();
    })
  })

  // TEST D'INTEGRATION GET
  describe('When I am on Bills Page', () => {
    test("fetches bills from mock API GET", async () => {
      // Défini le user en tant qu'employé
      localStorage.setItem("user", JSON.stringify({ 
        type: "Employee", 
        email: "a@a" 
      }))

      // cRéer un noeud pour intégrer le router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Lance le router
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      expect(await waitFor(() => screen.getByText('Mes notes de frais'))).toBeTruthy()
    })
  })
    
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      // Lance le router
      router()
    })
    
    // TEST 404 ERROR
    test("fetches bills from an API and fails with 404 message error", async () => {
      // Simule le rejet de la promesse
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
      }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 404/))

      expect(message).toBeTruthy()
    })
    
    // TEST 500 ERROR
    test("fetches messages from an API and fails with 500 message error", async () => {
      // Simule le rejet de la promesse
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
    
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 500/))

      expect(message).toBeTruthy()
    })
  })
})
