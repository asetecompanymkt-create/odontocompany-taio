/* =====================================================================
   OdontoCompany · Prótese Protocolo — comportamento da página
   - Seletor de cidade (Taió / Pouso Redondo) em todo CTA de WhatsApp
   - Player do vídeo-gancho (clique para tocar com som)
   - Tracking de clique (dataLayer -> Google Ads/GTM)
   Sem dependências. Ver README.md.
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     UNIDADES  —  EDITE AQUI
     wa: só dígitos, formato internacional. Celular BR no WhatsApp = 13
     dígitos: 55 + DDD(2) + 9 dígitos.  ⚠️ confira se não falta o "9".
     ------------------------------------------------------------------ */
  var UNITS = {
    taio: {
      nome: "Taió",
      wa: "554799745085",          // +55 47 9974-5085  (conferir dígitos)
      endereco: "",                // TODO: endereço da unidade de Taió
    },
    pouso: {
      nome: "Pouso Redondo",
      wa: "554797246007",          // +55 47 9724-6007  (conferir dígitos)
      endereco: "",                // TODO: endereço da unidade de Pouso Redondo
    },
  };

  // Mensagem pré-preenchida por origem do clique (data-cta)
  var MSGS = {
    default: "Olá, vim pela página e gostaria de agendar uma avaliação.",
    hero:    "Olá! Vi a página da Prótese Protocolo e quero fazer uma avaliação. Como funciona o parcelamento em 36x?",
    preco:   "Olá! Quero saber o valor da minha parcela da Prótese Protocolo em até 36x sem juros.",
    video:   "Olá! Assisti o vídeo sobre a Prótese Protocolo (dentes fixos) e quero entender melhor.",
    final:   "Olá! Quero agendar minha avaliação para a Prótese Protocolo (dentes fixos).",
  };

  function waLink(unitKey, ctaId) {
    var u = UNITS[unitKey];
    var msg = MSGS[ctaId] || MSGS.default;
    return "https://wa.me/" + u.wa + "?text=" + encodeURIComponent(msg);
  }

  function track(ctaId, unitKey) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "whatsapp_click",
      cta_id: ctaId || "default",
      unidade: unitKey ? UNITS[unitKey].nome : "",
    });
  }

  /* ---- Modal seletor de cidade ------------------------------------- */
  var modal = document.getElementById("city-modal");
  var lastFocus = null;
  var currentCta = "default";

  function openModal(ctaId) {
    currentCta = ctaId || "default";
    lastFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var first = modal.querySelector(".modal-choices .btn");
    if (first) first.focus();
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  if (modal) {
    // Preenche os dois botões do modal
    modal.querySelectorAll("[data-unit]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-unit");
        track(currentCta, key);
        window.open(waLink(key, currentCta), "_blank", "noopener");
        closeModal();
      });
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---- CTAs de WhatsApp -------------------------------------------- */
  // Página de cidade única (window.CITY = "taio" | "pouso") -> vai direto.
  // Página com as duas cidades (sem window.CITY) -> abre o modal seletor.
  var FIXED_CITY = (window.CITY && UNITS[window.CITY]) ? window.CITY : null;
  document.querySelectorAll(".js-cta").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var cta = el.getAttribute("data-cta") || "default";
      if (FIXED_CITY) {
        track(cta, FIXED_CITY);
        window.open(waLink(FIXED_CITY, cta), "_blank", "noopener");
      } else {
        openModal(cta);
      }
    });
  });

  /* ---- Botões diretos por unidade (seção Unidades) ----------------- */
  document.querySelectorAll(".js-unit-cta").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var key = el.getAttribute("data-unit");
      var cta = el.getAttribute("data-cta") || "unidade";
      track(cta, key);
      window.open(waLink(key, cta), "_blank", "noopener");
    });
  });

  /* ---- Player do vídeo-gancho -------------------------------------- */
  var vcard = document.querySelector(".video-card");
  if (vcard) {
    var video = vcard.querySelector("video");
    var playBtn = vcard.querySelector(".video-play");
    if (video && playBtn) {
      playBtn.addEventListener("click", function () {
        vcard.classList.add("is-playing");
        video.setAttribute("controls", "");
        video.muted = false;
        video.play().catch(function () {
          // se o navegador bloquear com som, toca mudo
          video.muted = true;
          video.play();
        });
        track("video_play", null);
      });
    }
  }

  /* ---- Reveal on scroll -------------------------------------------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Ano no rodapé ----------------------------------------------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
