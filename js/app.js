(function(){
  const fond = document.getElementById("fond");

  const q = document.getElementById("q");
  const moteurBtns = Array.from(document.querySelectorAll(".moteur-btn"));

  const favorisGrille = document.getElementById("favoris-grille");
  const favorisListe = document.getElementById("favoris-liste");
  const favoriNom = document.getElementById("favori-nom");
  const favoriUrl = document.getElementById("favori-url");
  const favoriAjouter = document.getElementById("favori-ajouter");


  const favorisMenu = document.getElementById("favoris-menu");
  const favorisMenuBtn = document.getElementById("favoris-menu-btn");
  const favorisMenuFermer = document.getElementById("favoris-menu-fermer");

  const reglagesMenu = document.getElementById("reglages-menu");
  const reglagesMenuBtn = document.getElementById("reglages-menu-btn");
  const reglagesMenuFermer = document.getElementById("reglages-menu-fermer");

  const FAVORIS_DEFAUT = [
    { nom: "Courriel", url: "https://mail.google.com/" },
    { nom: "Qwant", url: "https://www.qwant.com/" },
    { nom: "Carte", url: "https://www.openstreetmap.org/" },
    { nom: "Actualités", url: "https://www.francetvinfo.fr/" }
  ];

  function normaliserUrl(u){
    if(!u) return "";
    const val = u.trim();
    if(!/^https?:\/\//i.test(val)) return `https://${val}`;
    return val;
  }

  function domaineDepuisUrl(u){
    try { return new URL(u).hostname; } catch { return ""; }
  }

  function urlFavicon(siteUrl){
    const d = domaineDepuisUrl(siteUrl);
    if(!d) return "";
    return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(d)}.ico`;
  }

  function appliquerFond(dataUrl){
    if(!fond) return;
    if(dataUrl){
      fond.style.backgroundImage = `url('${dataUrl}')`;
    }else{
      fond.style.backgroundImage =
        "radial-gradient(900px 600px at 20% 15%, rgba(90,160,255,.35), transparent 60%)," +
        "radial-gradient(800px 500px at 80% 10%, rgba(255,130,200,.28), transparent 60%)," +
        "linear-gradient(135deg, #1a2a3a, #0d1117)";
    }
  }

  async function chargerFondAleatoire(){
    try{
      const themes = ["nature", "mountains", "forest", "landscape", "space"];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const page = Math.floor(Math.random() * 5) + 1;
      const api = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(theme)}&purity=100&sorting=random&atleast=1920x1080&page=${page}`;
      const resp = await fetch(api, { cache: "no-store" });
      if(!resp.ok) throw new Error(`Wallhaven HTTP ${resp.status}`);
      const payload = await resp.json();
      const items = Array.isArray(payload?.data) ? payload.data : [];
      if(!items.length) throw new Error("Wallhaven vide");
      const pick = items[Math.floor(Math.random() * items.length)];
      const image = pick?.path;
      if(!image) throw new Error("Wallhaven sans image");
      window.Stockage.set("fond", image);
      appliquerFond(image);
      return;
    }catch(_e){
      const fallback = `https://picsum.photos/1920/1080?random=${Date.now()}`;
      window.Stockage.set("fond", fallback);
      appliquerFond(fallback);
    }
  }

  function toggleMenu(menu, btn, forceOpen){
    if(!menu || !btn) return;
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !menu.classList.contains("ouvert");
    menu.classList.toggle("ouvert", shouldOpen);
    menu.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    btn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  chargerFondAleatoire();

  const URL_MOTEUR = {
    qwant: (texte) => `https://www.qwant.com/?q=${encodeURIComponent(texte)}&t=web`,
    duckduckgo: (texte) => `https://duckduckgo.com/?q=${encodeURIComponent(texte)}`,
    google: (texte) => `https://www.google.com/search?q=${encodeURIComponent(texte)}`,
    freepik: (texte) => `https://www.freepik.com/search?format=search&query=${encodeURIComponent(texte)}`,
    pinterest: (texte) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(texte)}`,
    amazon: (texte) => `https://www.amazon.fr/s?k=${encodeURIComponent(texte)}`,
    yahoo: (texte) => `https://search.yahoo.com/search?p=${encodeURIComponent(texte)}`,
    bing: (texte) => `https://www.bing.com/search?q=${encodeURIComponent(texte)}`
  };

  let moteurActif = window.Stockage.get("moteur", "qwant");

  function appliquerMoteur(m){
    if(!URL_MOTEUR[m]) m = "qwant";
    moteurActif = m;
    window.Stockage.set("moteur", m);
    moteurBtns.forEach((btn)=>{
      const actif = btn.dataset.moteur === m;
      btn.classList.toggle("actif", actif);
      btn.setAttribute("aria-pressed", actif ? "true" : "false");
    });
  }

  function faireRecherche(){
    const texte = (q?.value || "").trim();
    if(!texte) return;
    const url = (URL_MOTEUR[moteurActif] || URL_MOTEUR.qwant)(texte);
    window.location.href = url;
  }

  q?.addEventListener("keydown", (e)=>{ if(e.key === "Enter") faireRecherche(); });
  moteurBtns.forEach((btn)=>{
    btn.addEventListener("click", ()=>{
      appliquerMoteur(btn.dataset.moteur);
      if ((q?.value || "").trim()) faireRecherche();
      else q?.focus();
    });
  });
  appliquerMoteur(moteurActif);

let favoris = [];

async function chargerFavorisDepuisFichier() {
  try {
    const resp = await fetch("favoris.json", { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!Array.isArray(data)) throw new Error("Format favoris.json invalide (liste attendue).");

    // Nettoyage minimal
    const nettoyes = data
      .filter(x => x && typeof x === "object")
      .map(x => ({
        nom: (x.nom || "").toString().trim(),
        url: normaliserUrl((x.url || "").toString().trim())
      }))
      .filter(x => x.url);

    if (nettoyes.length === 0) throw new Error("favoris.json vide.");

    favoris = nettoyes;
    window.Stockage.set("favoris", favoris); // copie dans le stockage local
    rendreFavoris();
    return;
  } catch (err) {
    console.warn("Chargement favoris.json impossible, fallback stockage local.", err);
  }

  // Fallback : localStorage puis défaut
  const local = window.Stockage.get("favoris", null);
  if (Array.isArray(local) && local.length) {
    favoris = local;
  } else {
    favoris = FAVORIS_DEFAUT;
    window.Stockage.set("favoris", favoris);
  }
  rendreFavoris();
}

// Appeler à la place du chargement direct
chargerFavorisDepuisFichier();

  function rendreFavoris(){
    if(favorisGrille) favorisGrille.innerHTML = "";
    if(favorisListe) favorisListe.innerHTML = "";

    favoris.forEach((f, idx)=>{
      if(favorisGrille){
        const a = document.createElement("a");
        a.className = "favori";
        a.href = f.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.title = f.nom || f.url;

        const cadre = document.createElement("div");
        cadre.className = "favori-cadre";

        const img = document.createElement("img");
        img.alt = f.nom || "Favori";
        img.src = urlFavicon(f.url);
        cadre.appendChild(img);

        const nomElt = document.createElement("div");
        nomElt.className = "favori-nom-bref";
        nomElt.textContent = (f.nom || domaineDepuisUrl(f.url) || "Favori").slice(0, 18);

        a.appendChild(cadre);
        a.appendChild(nomElt);
        favorisGrille.appendChild(a);
      }

      if(favorisListe){
        const ligne = document.createElement("div");
        ligne.className = "favori-ligne";

        const nom = document.createElement("div");
        nom.className = "favori-nom";
        nom.textContent = `${f.nom || "Sans nom"} — ${f.url}`;

        const suppr = document.createElement("button");
        suppr.className = "bouton danger";
        suppr.type = "button";
        suppr.textContent = "Supprimer";
        suppr.addEventListener("click", ()=>{
          favoris.splice(idx, 1);
          window.Stockage.set("favoris", favoris);
          rendreFavoris();
        });

        ligne.appendChild(nom);
        ligne.appendChild(suppr);
        favorisListe.appendChild(ligne);
      }
    });
  }

  rendreFavoris();

  favoriAjouter?.addEventListener("click", ()=>{
    const nom = (favoriNom?.value || "").trim();
    const url = normaliserUrl((favoriUrl?.value || "").trim());
    if(!url) return;

    if (favoris.some(x => (x.url||"").toLowerCase() === url.toLowerCase())) return;

    favoris.unshift({
      nom: nom || domaineDepuisUrl(url) || url,
      url
    });

    window.Stockage.set("favoris", favoris);
    if (favoriNom) favoriNom.value = "";
    if (favoriUrl) favoriUrl.value = "";
    rendreFavoris();
  });

  favorisMenuBtn?.addEventListener("click", ()=>toggleMenu(favorisMenu, favorisMenuBtn));
  favorisMenuFermer?.addEventListener("click", ()=>toggleMenu(favorisMenu, favorisMenuBtn, false));

  reglagesMenuBtn?.addEventListener("click", ()=>toggleMenu(reglagesMenu, reglagesMenuBtn));
  reglagesMenuFermer?.addEventListener("click", ()=>toggleMenu(reglagesMenu, reglagesMenuBtn, false));
})();
