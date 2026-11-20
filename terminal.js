"use strict";

const form = document.querySelector(".command-form");
const promptText = form.querySelector(".prompt").textContent.trim();
const input = document.querySelector("#comando");
const terminal = document.querySelector("#terminal");
const historyView = document.querySelector("#historial");
const buttons = document.querySelectorAll("[data-command]");
const matrixButton = document.querySelector('[data-command="matrix"]');
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

function showStreak(result) {
  const summary = element("p", "Consultando el último conteo publicado…");
  result.append(summary, link("Ver mis contribuciones", profile));
  chartTitle(cardsUrl + "contribuciones.svg").then(
    (title) => {
      const streak = title.match(/Mejor racha de ([\d.]+ d[ií]as?)/i)?.[1];
      summary.textContent = streak ? streak + " seguidos con contribuciones en los últimos 12 meses." : title;
    },
    () => { summary.textContent = "El conteo está temporalmente indisponible."; }
  );
}

function showHelp(result) {
  const list = element("dl", "", "command-help");
  const topics = [
    ["whoami · perfil", "Lee mi presentación."],
    ["experience · experiencia", "Consulta mi experiencia de campo."],
    ["skills · habilidades", "Explora las tecnologías de mis proyectos."],
    ["projects · proyectos", "Abre mis repositorios destacados."],
    ["contributions · actividad", "Muestra mis contribuciones diarias y mensuales."],
    ["streak · racha", "Consulta mi mejor racha en GitHub."],
    ["formación", "Consulta mis estudios, cursos e insignias."],
    ["contact · enlaces", "Abre mi portafolio y GitHub."],
    ["matrix", "Activa o desactiva el modo Matrix."],
    ["clear · limpiar", "Limpia la consola."],
  ];
  for (const [name, description] of topics) {
    list.append(element("dt", name), element("dd", description));
  }
  result.append(list);
}

const commands = {
  ayuda: ["Comandos disponibles", showHelp],
  perfil: ["Sobre mí", (result) => {
    result.append(element("p", "Estudio Ingeniería de Sistemas en la Universidad César Vallejo. Desarrollo aplicaciones web, exploro datos e IA con Python y me formo en AWS."));
  }],
  experiencia: ["Experiencia", (result) => {
    result.append(element("p", "En el INEI coordiné y supervisé equipos de campo para recopilar datos censales en Piura. También participé en la aplicación de evaluaciones educativas."));
  }],
  habilidades: ["Tecnologías", (result) => {
    result.append(element("p", "React y JavaScript para desarrollo web. NumPy, Pygame y Streamlit para mis proyectos de datos e IA. Formación en fundamentos, redes y DevOps en AWS."));
  }],
  proyectos: ["Proyectos destacados", (result) => result.append(projectList())],
  formacion: ["Formación", (result) => result.append(trainingList())],
  actividad: ["Actividad en GitHub", showActivity],
  racha: ["Mejor racha", showStreak],
  enlaces: ["Dónde encontrarme", (result) => {
    const list = element("ul");
    for (const [name, url] of [["GitHub", profile], ["Portafolio", portfolio], ["Repositorios", profile + "?tab=repositories"]]) {
      const item = element("li");
      item.append(link(name, url));
      list.append(item);
    }
    result.append(list);
  }],
  matrix: ["Modo Matrix", (result) => {
    const enabled = terminal.classList.toggle("matrix-mode");
    matrixButton.setAttribute("aria-pressed", String(enabled));
    result.append(element("p", enabled ? "Activado. Escribe matrix para volver." : "Desactivado."));
  }],
};

const aliases = new Map([
  ["help", "ayuda"], ["whoami", "perfil"], ["about", "perfil"],
  ["experience", "experiencia"], ["skills", "habilidades"],
  ["projects", "proyectos"], ["ls", "proyectos"],
  ["contributions", "actividad"], ["streak", "racha"],
  ["contact", "enlaces"], ["clear", "limpiar"],
]);
const commandNames = [...Object.keys(commands), "limpiar", ...aliases.keys()];

function commandKey(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function runCommand(value, remember = true) {
  const entered = value.trim();
  if (!entered) return;
  const typedKey = commandKey(entered);
  const key = aliases.get(typedKey) ?? typedKey;
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
  if (remember) result.append(element("p", promptText + " " + entered, "echo"));
  if (Object.hasOwn(commands, key)) {
    const [title, render] = commands[key];
    result.append(element("h3", title));
    render(result);
  } else {
    result.append(element("p", "Comando desconocido. Escribe help o ayuda para ver las opciones."));
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
  if (event.key === "Tab" && !event.shiftKey) {
    const typed = commandKey(input.value.trim());
    if (typed && !commandNames.includes(typed)) {
      const matches = commandNames.filter((command) => command.startsWith(typed));
      if (matches.length === 1) {
        event.preventDefault();
        input.value = matches[0];
      }
    }
    return;
  }
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  event.preventDefault();
  const movement = event.key === "ArrowUp" ? -1 : 1;
  historyPosition = Math.max(0, Math.min(commandHistory.length, historyPosition + movement));
  input.value = commandHistory[historyPosition] ?? "";
});

runCommand("whoami", false);
