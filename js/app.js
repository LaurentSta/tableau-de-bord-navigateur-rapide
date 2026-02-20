(function(){
  const fond = document.getElementById("fond");

  const q = document.getElementById("q");
  const moteur = document.getElementById("moteur");
  const lancer = document.getElementById("lancer");

  const favorisGrille = document.getElementById("favoris-grille");
  const favorisListe = document.getElementById("favoris-liste");
  const favoriNom = document.getElementById("favori-nom");
  const favoriUrl = document.getElementById("favori-url");
  const favoriAjouter = document.getElementById("favori-ajouter");

  const fondFichier = document.getElementById("fond-fichier");
  const fondReset = document.getElementById("fond-reset");
  const fondAleatoire = document.getElementById("fond-aleatoire");
  const toutReset = document.getElementById("tout-reset");

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

  function toggleMenu(menu, btn, forceOpen){
    if(!menu || !btn) return;
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !menu.classList.contains("ouvert");
    menu.classList.toggle("ouvert", shouldOpen);
    menu.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    btn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  appliquerFond(window.Stockage.get("fond", null));

  fondFichier?.addEventListener("change", (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      window.Stockage.set("fond", dataUrl);
      appliquerFond(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  fondReset?.addEventListener("click", ()=>{
    window.Stockage.del("fond");
    appliquerFond(null);
    if (fondFichier) fondFichier.value = "";
  });

  async function chargerFondAleatoire(){
    const btn = fondAleatoire;
    const texteOriginal = btn?.textContent;
    try{
      if(btn){ btn.textContent = "Chargement…"; btn.disabled = true; }
      const resp = await fetch(`https://picsum.photos/1600/900?random=${Date.now()}`, { cache: "no-store", mode: "cors" });
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        window.Stockage.set("fond", dataUrl);
        appliquerFond(dataUrl);
        if(btn){ btn.textContent = texteOriginal || "Fond aléatoire"; btn.disabled = false; }
      };
      reader.onerror = () => { throw new Error("Lecture impossible"); };
      reader.readAsDataURL(blob);
    }catch(err){
      if(btn){ btn.textContent = "Erreur"; setTimeout(()=>{ btn.textContent = texteOriginal || "Fond aléatoire"; btn.disabled = false; }, 1400); }
      console.error(err);
    }
  }

  fondAleatoire?.addEventListener("click", chargerFondAleatoire);

  const URL_MOTEUR = {
    qwant: (texte) => `https://www.qwant.com/?q=${encodeURIComponent(texte)}&t=web`,
    duckduckgo: (texte) => `https://duckduckgo.com/?q=${encodeURIComponent(texte)}`,
    google: (texte) => `https://www.google.com/search?q=${encodeURIComponent(texte)}`,
    bing: (texte) => `https://www.bing.com/search?q=${encodeURIComponent(texte)}`
  };

  function faireRecherche(){
    const texte = (q?.value || "").trim();
    if(!texte) return;
    const m = moteur?.value || "qwant";
    const url = (URL_MOTEUR[m] || URL_MOTEUR.qwant)(texte);
    window.location.href = url;
  }

  lancer?.addEventListener("click", faireRecherche);
  q?.addEventListener("keydown", (e)=>{ if(e.key === "Enter") faireRecherche(); });

  if (moteur) moteur.value = window.Stockage.get("moteur", "qwant");
  moteur?.addEventListener("change", (e)=>window.Stockage.set("moteur", e.target.value));

  let favoris = window.Stockage.get("favoris", null);
  if(!Array.isArray(favoris) || favoris.length === 0){
    favoris = FAVORIS_DEFAUT;
    window.Stockage.set("favoris", favoris);
  }

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

  toutReset?.addEventListener("click", ()=>{
    const ok = confirm("Réinitialiser favoris, fond d’écran et réglages ?");
    if(!ok) return;
    window.Stockage.clear();
    location.reload();
  });

  favorisMenuBtn?.addEventListener("click", ()=>toggleMenu(favorisMenu, favorisMenuBtn));
  favorisMenuFermer?.addEventListener("click", ()=>toggleMenu(favorisMenu, favorisMenuBtn, false));

  reglagesMenuBtn?.addEventListener("click", ()=>toggleMenu(reglagesMenu, reglagesMenuBtn));
  reglagesMenuFermer?.addEventListener("click", ()=>toggleMenu(reglagesMenu, reglagesMenuBtn, false));
})();
