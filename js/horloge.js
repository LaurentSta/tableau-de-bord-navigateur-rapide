(function(){
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    const elH = document.getElementById("horloge");
    const elD = document.getElementById("date");
    if (elH) elH.textContent = `${hh}:${mm}`;

    if (elD) {
      const fmt = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
      elD.textContent = fmt.format(now);
    }
  }

  setInterval(tick, 250);
  tick();
})();
