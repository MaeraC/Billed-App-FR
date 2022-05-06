import { ROUTES_PATH } from '../constants/routes.js'

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    $('#layout-disconnect').click(this.handleClick)
  }
  // Renvoie vers la page de connexion 
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 