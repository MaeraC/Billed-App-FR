
import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = ''

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.store = store

    // Event envoie du formulaire Employé
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)
    // Event envoie du formulaire Admin 
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }

  // Gestion de l'envoie du formulaire partie Employé
  handleSubmitEmployee = e => {
    e.preventDefault()

    // Récupère les inputs Employee
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }

    // Définit le user en tant qu'employé
    this.localStorage.setItem("user", JSON.stringify(user))
    this.login(user)
      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        // Renvoie vers la page bill
        this.onNavigate(ROUTES_PATH['Bills'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        this.document.body.style.backgroundColor="#fff"
      })
  }

  // Gestion de l'envoie du formulaire de connexion de la partie administration
  handleSubmitAdmin = e => {
    e.preventDefault()

    // Récupère les inputs Admin 
    const user = {
      type: "Admin",
      // employee remplacé par admin
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected"
    }

    // Définit le user 
    this.localStorage.setItem("user", JSON.stringify(user))
    this.login(user)
      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        // Renvoie vers le dashboard Admin
        this.onNavigate(ROUTES_PATH['Dashboard'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        document.body.style.backgroundColor="#fff"
      })
  }

  // not need to cover this function by tests
  // Connexion
  login = (user) => {
    if (this.store) {
      return this.store
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      })).then(({jwt}) => {
        localStorage.setItem('jwt', jwt)
      })
    } else {
      return null
    }
  }

  // not need to cover this function by tests 
  createUser = (user) => {
    if (this.store) {
      return this.store
      .users()
      .create({data:JSON.stringify({
        type: user.type,
        name: user.email.split('@')[0],
        email: user.email,
        password: user.password,
      })})
      .then(() => {
        console.log(`User with ${user.email} is created`)
        return this.login(user)
      })
    } else {
      return null
    }
  } 
}
