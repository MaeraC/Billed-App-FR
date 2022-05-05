export const localStorageMock = (function() {
  let store = {};
  
  return {
    getItem: function(key) {
      return JSON.stringify(store[key]) // localStorage.getItem : récupère une donnée
    },
    setItem: function(key, value) { // localStorage.setItem : stock une donnée
      store[key] = value.toString()
    },
    clear: function() { // localStorage.clear : vide tout le stockage
      store = {}
    },
    removeItem: function(key) { // localStorage.removeItem : supprime une donnée
      delete store[key]
    }
  }
})()