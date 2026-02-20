(function(){
  const etat = () => document.getElementById("etat-meteo");
  const titre = () => document.getElementById("meteo-titre");
  const detail = () => document.getElementById("meteo-detail");
  const temp = () => document.getElementById("meteo-temp");

  function codeMeteo(code){
    const map = {
      0:"Ciel dégagé",
      1:"Plutôt dégagé",
      2:"Partiellement nuageux",
      3:"Couvert",
      45:"Brouillard",
      48:"Brouillard givrant",
      51:"Bruine faible",
      53:"Bruine modérée",
      55:"Bruine forte",
      61:"Pluie faible",
      63:"Pluie modérée",
      65:"Pluie forte",
      71:"Neige faible",
      73:"Neige modérée",
      75:"Neige forte",
      80:"Averses faibles",
      81:"Averses modérées",
      82:"Averses fortes",
      95:"Orage",
      96:"Orage + grêle",
      99:"Orage violent"
    };
    return map[code] || "Conditions variables";
  }

  async function fetchWeather(lat, lon, libelle){
    try{
      if (etat()) etat().textContent = "Météo : chargement…";

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,wind_speed_10m,weather_code&timezone=Europe%2FParis`;
      const r = await fetch(url, { cache: "no-store" });
      if(!r.ok) throw new Error("météo");

      const j = await r.json();
      const cur = j.current || {};
      const t = cur.temperature_2m;
      const w = cur.wind_speed_10m;
      const c = cur.weather_code;

      if (titre()) titre().textContent = libelle ? `Météo – ${libelle}` : "Météo";
      if (detail()) detail().textContent = `${codeMeteo(c)} · Vent ${Math.round(w)} km/h`;
      if (temp()) temp().textContent = `${Math.round(t)}°C`;
      if (etat()) etat().textContent = "Météo : ok";
    }catch{
      if (etat()) etat().textContent = "Météo : erreur";
      if (titre()) titre().textContent = "Météo indisponible";
      if (detail()) detail().textContent = "Vérifiez la connexion Internet.";
      if (temp()) temp().textContent = "--°C";
    }
  }

  async function geocodeCity(nom){
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nom)}&count=1&language=fr&format=json`;
    const r = await fetch(url, { cache: "no-store" });
    if(!r.ok) throw new Error("géocodage");
    const j = await r.json();
    const it = j.results && j.results[0];
    if(!it) throw new Error("ville");
    const libelle = `${it.name}${it.admin1 ? " ("+it.admin1+")" : ""}`;
    return { lat: it.latitude, lon: it.longitude, libelle };
  }

  async function chargerMeteo(){
    // 1) Géolocalisation si possible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos)=>{
        await fetchWeather(pos.coords.latitude, pos.coords.longitude, "Votre position");
      }, async ()=>{
        // 2) Sinon : ville enregistrée
        const ville = window.Stockage?.get("ville", "") || "";
        if (ville) {
          try{
            const g = await geocodeCity(ville);
            await fetchWeather(g.lat, g.lon, g.libelle);
          }catch{
            if (etat()) etat().textContent = "Météo : ville invalide";
            if (titre()) titre().textContent = "Météo non chargée";
            if (detail()) detail().textContent = "Indiquez une ville valide.";
            if (temp()) temp().textContent = "--°C";
          }
        } else {
          if (etat()) etat().textContent = "Météo : géolocalisation refusée";
        }
      }, { timeout: 7000 });
      return;
    }

    // 3) Géolocalisation indisponible
    if (etat()) etat().textContent = "Météo : géolocalisation indisponible";
  }

  // Expose pour app.js
  window.Meteo = { chargerMeteo };

  // Chargement initial + rafraîchissement
  chargerMeteo();
  setInterval(chargerMeteo, 10 * 60 * 1000);
})();