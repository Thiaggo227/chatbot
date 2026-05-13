"use strict";

// =========================
// CONFIG
// =========================
const API_URL =
  "https://script.google.com/macros/s/AKfycbylee4h1vLqxyweXo_WLip2HGFEvc3l1JHVP8YRqydjQZyPvg1eXaPmCK-PQ6HaTBjJ/exec";

// =========================
// STATE
// =========================
let passoAtual = -1;
let timeout = null;
let cache = [];
let selectedIndex = -1;
let aberto = false;

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initTheme();
  initSearch();
  carregarLiturgia();
  initReload();
  initNotes(); 
});

// =========================
// MENU
// =========================
function initMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.querySelector(".menu");
  const overlay = document.getElementById("overlay");
  const btnUp = document.querySelector(".btnUp");

  if (!menuToggle || !menu) return;

  menuToggle.addEventListener("click", () => {
    aberto = !aberto;
    const icon = menuToggle.querySelector("i");

    if (aberto) {
      icon?.classList.remove("bi-list");
      icon?.classList.add("bi-x");

      menu.classList.add("active");
      overlay?.classList.add("active");

      btnUp?.classList.add("hide-up");

    } else {
      fecharMenu();
    }
  });

  overlay?.addEventListener("click", fecharMenu);
}

function fecharMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.querySelector(".menu");
  const overlay = document.getElementById("overlay");
  const btnUp = document.querySelector(".btnUp");

  aberto = false;

  const icon = menuToggle?.querySelector("i");
  icon?.classList.remove("bi-x");
  icon?.classList.add("bi-list");

  menu?.classList.remove("active");
  overlay?.classList.remove("active");

  btnUp?.classList.remove("hide-up");
}

btnEdit?.addEventListener("click", () => {
  modalOverlay?.classList.add("active");
  document.body.style.overflow = "hidden"; // 🔥 trava scroll
  if (aberto) fecharMenu(); 
});

closeModal?.addEventListener("click", () => {
  modalOverlay?.classList.remove("active");
  document.body.style.overflow = ""; // 🔥 libera scroll
});

const img = document.getElementById("imgLit");

img.addEventListener("click", (e) => {
  e.stopPropagation(); // evita fechar ao clicar na própria imagem
  img.classList.toggle("expandida");
  document.body.classList.toggle("expandido");
});

document.addEventListener("click", () => {
  img.classList.remove("expandida");
  document.body.classList.remove("expandido");
});
// =========================
// THEME
// =========================
function initTheme() {
  const btnTheme = document.querySelector(".btnBlack");
  const iconTheme = btnTheme?.querySelector("i");
  const temaSalvo = localStorage.getItem("theme");

  if (temaSalvo === "dark") {
    document.body.classList.add("dark");
    trocarIcon(true, iconTheme);
  }

  btnTheme?.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    trocarIcon(isDark, iconTheme);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

function trocarIcon(isDark, iconTheme) {
  if (!iconTheme) return;
  iconTheme.classList.toggle("bi-moon-stars", !isDark);
  iconTheme.classList.toggle("bi-brightness-high-fill", isDark);
}

// =========================
// SEARCH
// =========================
function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    const value = input.value.trim();

    if (!value) {
      limparResultados();
      return;
    }

    timeout = setTimeout(() => search(value), 300);
  });
}

async function search(query) {
  const box = document.getElementById("resultsBox");
  if (!box) return;

  const q = normalize(query);
  selectedIndex = -1;

  if (q.length < 2) {
    limparResultados();
    return;
  }
  const input = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

input.addEventListener("input", () => {
  clearBtn.style.display = input.value ? "block" : "none";
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  clearBtn.style.display = "none";
  input.focus();
});

  // Define o timeout para mostrar o loader
  let loaderTimeout = setTimeout(() => {
    showLoader(box);
  }, 200);

  try {
    if (cache.length === 0) {
      const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      cache = Array.isArray(data) ? data : [];
    }

    const results = cache
      .map(item => {
        const termo = normalize(item.termo);
        const desc = normalize(item.descricao);
        let score = 0;
        if (termo === q) score += 100;
        else if (termo.startsWith(q)) score += 70;
        else if (termo.includes(q)) score += 40;
        if (desc.includes(q)) score += 20;
        return { item, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.item);

    clearTimeout(loaderTimeout);
    
    // Limpa o loader antes de renderizar os resultados reais
    box.innerHTML = ""; 
    renderResults(results, query);

  } catch (error) {
    clearTimeout(loaderTimeout);
    box.innerHTML = `<div style="padding:10px;color:red;">Erro na busca</div>`;
    box.classList.remove("no-shadow");
    box.classList.add("show-shadow");
  }
}

function limparResultados() {
  const box = document.getElementById("resultsBox");
  if (box) {
    box.innerHTML = "";
    box.classList.remove("show-shadow");
  }
}

function renderResults(data, query) {
  const box = document.getElementById("resultsBox");
  if (!box) return;

  box.classList.remove("no-shadow");
  box.classList.add("show-shadow");

  if (data.length === 0) {
    box.innerHTML = `<div style="padding:10px; color:var(--text-soft);">Nenhum resultado encontrado.</div>`;
    return;
  }

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <strong>${item.termo}</strong>
      <small>${item.descricao || ""}</small>
    `;
    div.onclick = () => {
      const input = document.getElementById("searchInput");
      if (input) input.value = item.termo;
      limparResultados();
    };
    box.appendChild(div);
  });
}

function showLoader(box) {
  box.classList.add("show-shadow");
  box.classList.add("no-shadow"); 

  box.innerHTML = `
    <div class="load">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  `;
}
// =========================
// LITURGIA (100% LOCAL)
// =========================
function carregarLiturgia() {
  const hoje = new Date();

  const ano = hoje.getFullYear();

  const pascoa = calcularPascoa(ano);

  const quartaCinzas = addDias(pascoa, -46);
  const domingoRamos = addDias(pascoa, -7);
  const pentecostes = addDias(pascoa, 49);

  const natal = new Date(ano, 11, 25);
  const advento = calcularAdvento(ano);

  let season = "";
  let color = "";
  let celebracao = "";

  if (hoje >= quartaCinzas && hoje < domingoRamos) {
    season = "Lent";
    color = "purple";
    celebracao = "Quaresma";
  }
  else if (hoje >= domingoRamos && hoje < pascoa) {
    season = "Lent";
    color = "red";
    celebracao = "Semana Santa";
  }
  else if (hoje >= pascoa && hoje <= pentecostes) {
    season = "Easter Time";
    color = "white";
    celebracao = "Tempo Pascal";
  }
  else if (hoje >= advento && hoje < natal) {
    season = "Advent";
    color = "purple";
    celebracao = "Advento";
  }
  else if (hoje >= natal || hoje < calcularBatismoSenhor(ano)) {
    season = "Christmas Time";
    color = "white";
    celebracao = "Natal";
  }
  else {
    season = "Ordinary Time";
    color = "green";
    celebracao = "Tempo Comum";
  }

  atualizarTela({
    date: hoje.toISOString().split("T")[0],
    season,
    color,
    celebrations: [{ title: celebracao }]
  });
}
function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);
}

function addDias(data, dias) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function calcularAdvento(ano) {
  const natal = new Date(ano, 11, 25);
  const diaSemana = natal.getDay();

  const ultimoDomingoAntesNatal = addDias(natal, -diaSemana);

  return addDias(ultimoDomingoAntesNatal, -21);
}

function calcularBatismoSenhor(ano) {
  const epifania = new Date(ano, 0, 6);
  const diaSemana = epifania.getDay();

  const proximoDomingo = addDias(epifania, (7 - diaSemana) % 7);

  return proximoDomingo;
}

function atualizarTela(data) {
  setText("liturgia-data", formatarData(data.date));
  setText("tempo", traduzirTempo(data.season));
  setText("cor", traduzirCor(data.color));
  setText("celebracao", data.celebrations?.[0]?.title || "N/A");
}

// =========================
// NOTAS / MODAL
// =========================
function initNotes() {
  const btnEdit = document.getElementById("btnEdit");
  const modalOverlay = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const saveNotes = document.getElementById("saveNotes");
  const noteArea = document.getElementById("noteArea");

  const savedNote = localStorage.getItem("wiki_liturgy_note");
  if (savedNote && noteArea) {
    noteArea.value = savedNote;
  }

  btnEdit?.addEventListener("click", () => {
    modalOverlay?.classList.add("active");
    if (aberto) fecharMenu(); 
  });

  closeModal?.addEventListener("click", () => {
    modalOverlay?.classList.remove("active");
  });

  saveNotes?.addEventListener("click", () => {
    const text = noteArea.value;
    localStorage.setItem("wiki_liturgy_note", text);
    
    const originalText = saveNotes.innerText;
    saveNotes.innerText = "Salvo!";

    setTimeout(() => {
      saveNotes.innerText = originalText;
    }, 1200);
  });
}

// =========================
// HELPERS
// =========================
function normalize(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function formatarData(d) {
  if (!d) return "";
  const p = d.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function traduzirTempo(t) {
  return {
    "Easter Time": "Easter Time",
    Lent: "Lent",
    Advent: "Advent",
    "Christmas Time": "Christmas Time",
    "Ordinary Time": "Ordinary Time"
  }[t] || t;
}

function traduzirCor(c) {
  return {
    green: "🟢 Green",
    purple: "🟣 Purple",
    white: "⚪ White",
    red: "🔴 Red"
  }[c] || c;
}

// =========================
// RELOAD
// =========================
function initReload() {
  document.querySelector(".btnUp")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.reload();
  });
}