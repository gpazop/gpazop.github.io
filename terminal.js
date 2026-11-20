"use strict";

const form = document.querySelector(".command-form");
const input = document.querySelector("#comando");
const historyView = document.querySelector("#historial");
const buttons = document.querySelectorAll("[data-command]");
const commandHistory = [];
let historyPosition = 0;

const profile = "https://github.com/gpazop";
const portfolio = "https://mi-primera-web-lilac.vercel.app/";
const cardsUrl = "https://raw.githubusercontent.com/gpazop/gpazop/main/cards/";

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(title, url) {
  const anchor = element("a", title);
  anchor.href = url;
  return anchor;
}

function projectList() {
  const projects = [
    ["FuPais", profile + "/FuPais", "App en React para seguir estancias y plazos migratorios."],
    ["Neurito", profile + "/neurito-red-neuronal", "Mascota virtual con una red neuronal en NumPy y Pygame."],
    ["Análisis de vuelos", profile + "/vuelos-app-equipo", "Exploración de retrasos de vuelos en Nueva York con Python y Streamlit."],
  ];
  const list = element("ul");
  for (const [name, url, description] of projects) {
    const item = element("li");
    item.append(link(name, url), " · " + description);
    list.append(item);
  }
  return list;
}

function trainingList() {
  const list = element("ul");
  const training = [
    "Universidad César Vallejo · Ingeniería de Sistemas y certificación progresiva de Asistente de Help Desk.",
    "AWS Training & Certification · Insignia Cloud Essentials y formación en fundamentos técnicos, redes, DevOps y gestión de costos.",
    "Cisco Networking Academy · CCNA: Introduction to Networks.",
    "Red Hat Academy · Introduction to Red Hat OpenShift AI.",
  ];
  for (const item of training) list.append(element("li", item));
  return list;
}

async function chartTitle(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) throw new Error("El gráfico no está disponible.");
  const data = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
  const title = data.querySelector("svg > title")?.textContent.trim();
  if (!title) throw new Error("El gráfico no contiene un resumen.");
  return title;
}

function showActivity(result) {
  const summary = element("p", "Consultando el último conteo publicado…", "chart-summary");
  const charts = [
    ["contribuciones.svg", "Contribuciones por mes", 334],
    ["actividad.svg", "Calendario de contribuciones diarias", 225],
  ];
  result.append(summary);
  for (const [filename, label, height] of charts) {
    const image = element("img", "", "chart");
    image.src = cardsUrl + filename;
    image.alt = label;
    image.width = 880;
    image.height = height;
    image.decoding = "async";
    result.append(image);
  }
  result.append(link("Ver el calendario en GitHub", profile));

  chartTitle(cardsUrl + charts[0][0]).then(
    (title) => { summary.textContent = title; },
    () => { summary.textContent = "El resumen está temporalmente indisponible. Puedes consultar mi actividad en GitHub."; }
  );
}

const commands = {
  ayuda: ["Comandos disponibles", (result) => {
    result.append(element("p", "perfil · proyectos · formación · actividad · enlaces · limpiar"));
  }],
  perfil: ["Sobre mí", (result) => {
    result.append(element("p", "Estudio Ingeniería de Sistemas en la Universidad César Vallejo. Desarrollo aplicaciones web y exploro datos e IA con Python. También tengo experiencia de campo en el INEI, incluida la coordinación de equipos para recopilar datos censales."));
  }],
  proyectos: ["Proyectos destacados", (result) => result.append(projectList())],
  formacion: ["Formación", (result) => result.append(trainingList())],
  actividad: ["Actividad en GitHub", showActivity],
  enlaces: ["Dónde encontrarme", (result) => {
    const list = element("ul");
    for (const [name, url] of [["GitHub", profile], ["Portafolio", portfolio], ["Repositorios", profile + "?tab=repositories"]]) {
      const item = element("li");
      item.append(link(name, url));
      list.append(item);
    }
    result.append(list);
  }],
};

function commandKey(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function runCommand(value, remember = true) {
  const entered = value.trim();
  if (!entered) return;
  const key = commandKey(entered);
  if (remember) {
    commandHistory.push(entered);
    if (commandHistory.length > 40) commandHistory.shift();
    historyPosition = commandHistory.length;
  }
  if (key === "limpiar") {
    historyView.replaceChildren();
    return;
  }
  const result = element("article", "", "result");
  if (remember) result.append(element("p", "~ $ " + entered, "echo"));
  if (Object.hasOwn(commands, key)) {
    const [title, render] = commands[key];
    result.append(element("h3", title));
    render(result);
  } else {
    result.append(element("p", "Comando desconocido. Escribe ayuda para ver las opciones."));
  }
  historyView.append(result);
  if (historyView.children.length > 20) historyView.firstElementChild.remove();
  historyView.scrollTop += result.getBoundingClientRect().top - historyView.getBoundingClientRect().top - 8;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runCommand(input.value);
  input.value = "";
  input.focus();
});

for (const button of buttons) {
  button.addEventListener("click", () => runCommand(button.dataset.command));
}

input.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  event.preventDefault();
  const movement = event.key === "ArrowUp" ? -1 : 1;
  historyPosition = Math.max(0, Math.min(commandHistory.length, historyPosition + movement));
  input.value = commandHistory[historyPosition] ?? "";
});

runCommand("proyectos", false);
