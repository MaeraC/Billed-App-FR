/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import mockStore from "../__mocks__/store.js";


// AJOUT DES TESTS
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Vérifie que l'icône est en surbrillance 
    test("Then mail icon should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))

      const iconMail = screen.getByTestId('icon-mail')
      expect(iconMail.classList.contains('active-icon')).toBe(true) 
    })

    // Vérifie que le formulaire est bien affiché 
    test("Then the new bill's form should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByRole("button")).toBeTruthy();
    })

    // Vérifie que le téléchargement d'une image est bien possible 
    test('Then I can upload an image file', () => {
      const html = NewBillUI();

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "azerty@email.com",
      }))

      document.body.innerHTML = html;

      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({})
          },
        }
      })

      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();

      const file = new File(["file"], "file.jpg", { type: "image/jpeg" })

      // Je simule que le fichier est un jpg
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          files: [file],
        },
      });

      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files).toHaveLength(1);
      expect(inputJustificative.files[0].name).toBe("file.jpg");

      jest.spyOn(window, "alert").mockImplementation(() => {
      });

      expect(window.alert).not.toHaveBeenCalled();
    })

    // Une alerte apparait si je télécharge un fichier autre qu'une image 
    // Vérifie que le téléchargement d'un document autre qu'au format image est impossible
    test("Then I can't upload a non image file", () => {
      // Mock Alert
      const html = NewBillUI();
      document.body.innerHTML = html;

      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Je mock la function handleChangeFile()
      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputJustificative = screen.getByTestId("file");

      expect(inputJustificative).toBeTruthy();

     // Je simule que le fichier est au mauvais format
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          // object File ([fichier], "nomDuFichier", {type: "typeDuFichier"})
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });
      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files[0].name).not.toBe("file.jpg");

      jest.spyOn(window, "alert").mockImplementation(() => {
      });
      expect(window.alert).toHaveBeenCalled();
    })
  })

  
  describe("When I submit the form completed", () => {
    // Vérifie que la facture est bien créée
    test("Then the bill is created", async () => {

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "azerty@email.com",
      }))

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      const validBill = {
        type: "Transport",
        name: "Vol France Chine",
        date: "2022-04-14",
        amount: 600,
        vat: 0,
        pct: 2,
        commentary: "RAS",
        fileUrl: "../img/0.jpg",
        fileName: "Billet-avion-test.jpg",
        status: "pending"
      };

      // Intégration des valeurs dans les champs
      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;

      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

      // Envoi du formulaire
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
    })

    test('fetches error from an API and fails with 500 error', async () => {
      
      //console.log("présente", mockStore)
      jest.spyOn(mockStore, 'bills')
      //console.log("présente-2", mockStore)
      jest.spyOn(console, 'error').mockImplementation(() => {
      })// Renvoie le code erreur de jest dans la console

      // Récupère localStorageMock depuis le fichier localStorage.js
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

      // Défini le user en tant qu'employé dans le localStorage
      window.localStorage.setItem(
        'user', JSON.stringify({ type: 'Employee' })
      )

      document.body.innerHTML = `<div id="root"></div>`
      router()

      // Récupère le pathname de l'url comme étant #employee/bill/new
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      })

      // New bill créée à partir de ses paramètres 
      const newBill = new NewBill({ 
        document, 
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // ENVOIE DU FORMULAIRE
      // Récupère form-new-bill
      const form = screen.getByTestId('form-new-bill')
      // Crée une nouvelle simulation pour gérer l'event du formulaire
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      // Lance l'event handleSubmit si le formulaire est soumis 
      form.addEventListener('submit', handleSubmit)
      // Crée un event au click et le dispatche dans le DOM
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })
})
