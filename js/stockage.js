// Stockage local simple et robuste
window.Stockage = {
  get(cle, defautValeur = null) {
    try {
      const v = JSON.parse(localStorage.getItem(cle));
      return (v === null || v === undefined) ? defautValeur : v;
    } catch {
      return defautValeur;
    }
  },
  set(cle, valeur) {
    localStorage.setItem(cle, JSON.stringify(valeur));
  },
  del(cle) {
    localStorage.removeItem(cle);
  },
  clear() {
    localStorage.clear();
  }
};