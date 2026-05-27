/* =============================================
   DataTree – script.js
   POO: Clases Node, BST, GraphNode, Graph
   ============================================= */
 
"use strict";
 
/* ══════════════════════════════════════
   NAVEGACIÓN
══════════════════════════════════════ */
function goTo(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const sec = document.getElementById(sectionId);
  if (sec) sec.classList.add("active");
  const btn = document.querySelector(`[data-section="${sectionId}"]`);
  if (btn) btn.classList.add("active");
 
  if (sectionId === "arboles") { resizeTreeCanvas(); }
  if (sectionId === "grafos")  { resizeGraphCanvas(); }
}
 
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    goTo(btn.dataset.section);
  });
});
 
// Hamburger
document.getElementById("hamburger").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("open");
});
 
// Tabs
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const group = tab.closest(".section");
    group.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    group.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});
 
 
/* ══════════════════════════════════════
   HERO CANVAS – árbol decorativo animado
══════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
 
  // Estructura decorativa fija
  const nodes = [
    { x: 230, y: 60,  val: 50, children: [1, 2] },
    { x: 120, y: 150, val: 30, children: [3, 4] },
    { x: 340, y: 150, val: 70, children: [5, 6] },
    { x: 60,  y: 250, val: 20, children: [] },
    { x: 180, y: 250, val: 40, children: [] },
    { x: 280, y: 250, val: 60, children: [] },
    { x: 400, y: 250, val: 80, children: [7] },
    { x: 440, y: 330, val: 90, children: [] },
  ];
 
  let t = 0;
  let highlightIdx = 0;
  const ORDER = [0,1,3,4,2,5,6,7];
  let orderPos = 0;
  let lastSwitch = 0;
 
  function drawHero(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t = ts / 1000;
 
    if (t - lastSwitch > 0.55) {
      highlightIdx = ORDER[orderPos % ORDER.length];
      orderPos++;
      lastSwitch = t;
    }
 
    // Aristas
    nodes.forEach((n, i) => {
      n.children.forEach(ci => {
        const c = nodes[ci];
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = "rgba(139,92,246,0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
 
    // Nodos
    nodes.forEach((n, i) => {
      const isHL = i === highlightIdx;
      const pulse = isHL ? Math.sin(t * 8) * 3 : 0;
      const r = 26 + pulse;
 
      // Glow
      if (isHL) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#8B5CF6";
      } else {
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(139,92,246,0.3)";
      }
 
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHL ? "#1e1a3a" : "#111827";
      ctx.fill();
      ctx.strokeStyle = isHL ? "#8B5CF6" : "rgba(139,92,246,0.4)";
      ctx.lineWidth = isHL ? 2.5 : 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
 
      ctx.fillStyle = isHL ? "#fff" : "rgba(229,231,235,0.7)";
      ctx.font = `bold ${isHL ? 14 : 12}px 'Space Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.val, n.x, n.y);
    });
 
    requestAnimationFrame(drawHero);
  }
  requestAnimationFrame(drawHero);
})();
 
 
/* ══════════════════════════════════════
   ÁRBOL – CLASES POO
══════════════════════════════════════ */
 
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left  = null;
    this.right = null;
  }
}
 
class BST {
  constructor() {
    this.root = null;
  }
 
  // Inserción recursiva
  insert(value) {
    this.root = this._insertRec(this.root, value);
  }
 
  _insertRec(node, value) {
    if (node === null) return new TreeNode(value);
    if (value < node.value) {
      node.left  = this._insertRec(node.left, value);
    } else if (value > node.value) {
      node.right = this._insertRec(node.right, value);
    }
    // Duplicado: no se inserta
    return node;
  }
 
  // Búsqueda: retorna array de valores visitados (camino)
  search(value) {
    const path = [];
    let node = this.root;
    while (node !== null) {
      path.push(node.value);
      if (value === node.value) return { found: true, path };
      node = value < node.value ? node.left : node.right;
    }
    return { found: false, path };
  }
 
  // Eliminación
  delete(value) {
    const { exists } = this._exists(this.root, value);
    if (!exists) return false;
    this.root = this._deleteRec(this.root, value);
    return true;
  }
 
  _exists(node, value) {
    if (!node) return { exists: false };
    if (value === node.value) return { exists: true };
    if (value < node.value) return this._exists(node.left, value);
    return this._exists(node.right, value);
  }
 
  _deleteRec(node, value) {
    if (node === null) return null;
    if (value < node.value) {
      node.left  = this._deleteRec(node.left, value);
    } else if (value > node.value) {
      node.right = this._deleteRec(node.right, value);
    } else {
      // Caso 1: hoja
      if (!node.left && !node.right) return null;
      // Caso 2: un hijo
      if (!node.left)  return node.right;
      if (!node.right) return node.left;
      // Caso 3: dos hijos → sucesor inorden (mínimo del subárbol derecho)
      const minVal = this._minValue(node.right);
      node.value = minVal;
      node.right = this._deleteRec(node.right, minVal);
    }
    return node;
  }
 
  _minValue(node) {
    let cur = node;
    while (cur.left) cur = cur.left;
    return cur.value;
  }
 
  // Recorridos – retornan arreglo de valores
  preorden() {
    const res = [];
    this._preRec(this.root, res);
    return res;
  }
  _preRec(node, res) {
    if (!node) return;
    res.push(node.value);
    this._preRec(node.left, res);
    this._preRec(node.right, res);
  }
 
  inorden() {
    const res = [];
    this._inRec(this.root, res);
    return res;
  }
  _inRec(node, res) {
    if (!node) return;
    this._inRec(node.left, res);
    res.push(node.value);
    this._inRec(node.right, res);
  }
 
  postorden() {
    const res = [];
    this._postRec(this.root, res);
    return res;
  }
  _postRec(node, res) {
    if (!node) return;
    this._postRec(node.left, res);
    this._postRec(node.right, res);
    res.push(node.value);
  }
 
  porNiveles() {
    if (!this.root) return [];
    const res = [];
    const queue = [this.root];
    while (queue.length > 0) {
      const node = queue.shift();
      res.push(node.value);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return res;
  }
 
  height() {
    return this._heightRec(this.root);
  }
  _heightRec(node) {
    if (!node) return 0;
    return 1 + Math.max(this._heightRec(node.left), this._heightRec(node.right));
  }
 
  count() {
    return this._countRec(this.root);
  }
  _countRec(node) {
    if (!node) return 0;
    return 1 + this._countRec(node.left) + this._countRec(node.right);
  }
 
  clear() { this.root = null; }
}
 
 
/* ÁRBOL – VISUALIZACIÓN CON CANVAS*/
 
const treeCanvas  = document.getElementById("treeCanvas");
const treeCtx     = treeCanvas.getContext("2d");
const treeLog     = document.getElementById("treeLog");
const treeInfo    = document.getElementById("treeInfo");
const bst         = new BST();
 
let treeHighlight = {}; // { value: color }
let treeAnimQueue = []; // valores a animar secuencialmente
let treeAnimTimer = null;
 
function resizeTreeCanvas() {
  const wrap = treeCanvas.parentElement;
  treeCanvas.width  = wrap.clientWidth;
  treeCanvas.height = Math.max(wrap.clientHeight - 50, 400);
  drawTree();
}
 
function logTree(msg, type = "") {
  const p = document.createElement("p");
  p.className = `log-entry ${type}`;
  p.textContent = `> ${msg}`;
  treeLog.querySelector(".log-placeholder")?.remove();
  treeLog.insertBefore(p, treeLog.firstChild);
  if (treeLog.children.length > 30) treeLog.removeChild(treeLog.lastChild);
}
 
// Layout del árbol: calcula posición x,y para cada nodo
function computeLayout(node, depth, left, right, positions) {
  if (!node) return;
  const x = (left + right) / 2;
  const y = 60 + depth * 80;
  positions.set(node, { x, y });
  computeLayout(node.left,  depth + 1, left, (left + right) / 2, positions);
  computeLayout(node.right, depth + 1, (left + right) / 2, right, positions);
}
 
function drawTree() {
  const W = treeCanvas.width;
  const H = treeCanvas.height;
  treeCtx.clearRect(0, 0, W, H);
 
  if (!bst.root) {
    treeCtx.fillStyle = "rgba(107,114,128,0.5)";
    treeCtx.font = "16px 'Syne', sans-serif";
    treeCtx.textAlign = "center";
    treeCtx.fillText("El árbol está vacío. Inserta un valor.", W / 2, H / 2);
    treeInfo.textContent = "Árbol vacío";
    return;
  }
 
  const positions = new Map();
  computeLayout(bst.root, 0, 0, W, positions);
 
  // Aristas
  positions.forEach((pos, node) => {
    if (node.left && positions.has(node.left)) {
      const ch = positions.get(node.left);
      drawEdge(treeCtx, pos.x, pos.y, ch.x, ch.y);
    }
    if (node.right && positions.has(node.right)) {
      const ch = positions.get(node.right);
      drawEdge(treeCtx, pos.x, pos.y, ch.x, ch.y);
    }
  });
 
  // Nodos
  positions.forEach((pos, node) => {
    const color = treeHighlight[node.value] || "default";
    drawNode(treeCtx, pos.x, pos.y, node.value, color);
  });
 
  // Info
  treeInfo.textContent = `Nodos: ${bst.count()}  |  Altura: ${bst.height()}  |  Inorden: [${bst.inorden().join(", ")}]`;
}
 
function drawEdge(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "rgba(139,92,246,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();
}
 
function drawNode(ctx, x, y, val, colorKey) {
  const R = 22;
  let fill   = "#111827";
  let stroke = "#8B5CF6";
  let text   = "#E5E7EB";
 
  if (colorKey === "highlight") { fill = "#1e1a3a"; stroke = "#8B5CF6"; ctx.shadowBlur = 14; ctx.shadowColor = "#8B5CF6"; }
  if (colorKey === "found")     { fill = "#062030"; stroke = "#06B6D4"; text = "#06B6D4"; ctx.shadowBlur = 14; ctx.shadowColor = "#06B6D4"; }
  if (colorKey === "path")      { fill = "#0d1f3a"; stroke = "#3B82F6"; ctx.shadowBlur = 8; ctx.shadowColor = "#3B82F6"; }
  if (colorKey === "visited")   { fill = "#1a1030"; stroke = "#8B5CF6"; text = "#8B5CF6"; ctx.shadowBlur = 8; ctx.shadowColor = "#8B5CF6"; }
  if (colorKey === "inserted")  { fill = "#051a30"; stroke = "#3B82F6"; text = "#3B82F6"; ctx.shadowBlur = 14; ctx.shadowColor = "#3B82F6"; }
 
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
 
  ctx.fillStyle = text;
  ctx.font = "bold 12px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(val, x, y);
}
 
// Animar recorrido: resalta nodos uno a uno
function animateTraversal(values, color = "visited") {
  clearTimeout(treeAnimTimer);
  treeHighlight = {};
  let i = 0;
  function step() {
    if (i > 0) treeHighlight[values[i - 1]] = color;
    drawTree();
    if (i < values.length) {
      treeHighlight[values[i]] = "highlight";
      drawTree();
      i++;
      treeAnimTimer = setTimeout(step, 500);
    } else {
      // Mantener coloreado 2 s luego limpiar
      setTimeout(() => { treeHighlight = {}; drawTree(); }, 2000);
    }
  }
  step();
}
 
// Animar búsqueda (camino + resultado)
function animateSearch(path, found) {
  clearTimeout(treeAnimTimer);
  treeHighlight = {};
  let i = 0;
  function step() {
    if (i > 0) treeHighlight[path[i - 1]] = "path";
    drawTree();
    if (i < path.length) {
      treeHighlight[path[i]] = "highlight";
      drawTree();
      i++;
      treeAnimTimer = setTimeout(step, 500);
    } else {
      const last = path[path.length - 1];
      treeHighlight[last] = found ? "found" : "path";
      drawTree();
      setTimeout(() => { treeHighlight = {}; drawTree(); }, 2000);
    }
  }
  step();
}
 
// Eventos del árbol
document.getElementById("btnInsert").addEventListener("click", () => {
  const val = parseInt(document.getElementById("treeInput").value);
  if (isNaN(val)) { logTree("Ingresa un número válido", "error"); return; }
  const before = bst.count();
  bst.insert(val);
  if (bst.count() === before) {
    logTree(`El valor ${val} ya existe en el árbol`, "warn");
  } else {
    treeHighlight = { [val]: "inserted" };
    drawTree();
    setTimeout(() => { treeHighlight = {}; drawTree(); }, 1200);
    logTree(`Insertado: ${val}`);
  }
  document.getElementById("treeInput").value = "";
});
 
document.getElementById("btnSearch").addEventListener("click", () => {
  const val = parseInt(document.getElementById("treeSearch").value);
  if (isNaN(val)) { logTree("Ingresa un número válido", "error"); return; }
  const { found, path } = bst.search(val);
  animateSearch(path, found);
  if (found) logTree(`✔ Encontrado: ${val}  |  Camino: [${path.join(" → ")}]`, "found");
  else       logTree(`✘ No encontrado: ${val}  |  Camino: [${path.join(" → ")}]`, "error");
  document.getElementById("treeSearch").value = "";
});
 
document.getElementById("btnDelete").addEventListener("click", () => {
  const val = parseInt(document.getElementById("treeDelete").value);
  if (isNaN(val)) { logTree("Ingresa un número válido", "error"); return; }
  const deleted = bst.delete(val);
  if (deleted) { drawTree(); logTree(`Eliminado: ${val}`); }
  else logTree(`El valor ${val} no existe en el árbol`, "error");
  document.getElementById("treeDelete").value = "";
});
 
document.querySelectorAll(".btn-trav[data-trav]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!bst.root) { logTree("El árbol está vacío", "warn"); return; }
    const trav = btn.dataset.trav;
    let vals;
    if (trav === "preorden")  vals = bst.preorden();
    if (trav === "inorden")   vals = bst.inorden();
    if (trav === "postorden") vals = bst.postorden();
    if (trav === "niveles")   vals = bst.porNiveles();
    logTree(`${trav.toUpperCase()}: [${vals.join(", ")}]`);
    animateTraversal(vals);
  });
});
 
document.getElementById("btnSample").addEventListener("click", () => {
  bst.clear();
  treeHighlight = {};
  [50, 30, 70, 20, 40, 60, 80, 10, 90].forEach(v => bst.insert(v));
  drawTree();
  logTree("Árbol de ejemplo cargado: [50, 30, 70, 20, 40, 60, 80, 10, 90]");
});
 
document.getElementById("btnClear").addEventListener("click", () => {
  bst.clear();
  treeHighlight = {};
  clearTimeout(treeAnimTimer);
  drawTree();
  logTree("Árbol limpiado");
});
 
// Enter en inputs
document.getElementById("treeInput").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("btnInsert").click(); });
document.getElementById("treeSearch").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("btnSearch").click(); });
document.getElementById("treeDelete").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("btnDelete").click(); });
 
 
/* ══════════════════════════════════════
   GRAFOS – CLASES POO
══════════════════════════════════════ */
 
class GraphVertex {
  constructor(id, x, y) {
    this.id = id;
    this.x  = x;
    this.y  = y;
  }
}
 
class Graph {
  constructor() {
    this.vertices = new Map(); // id → GraphVertex
    this.edges    = new Set(); // Set de "A-B" strings (no dirigido)
    this.adjList  = new Map(); // id → Set(ids)
  }
 
  addVertex(id, x, y) {
    if (this.vertices.has(id)) return false;
    this.vertices.set(id, new GraphVertex(id, x, y));
    this.adjList.set(id, new Set());
    return true;
  }
 
  removeVertex(id) {
    if (!this.vertices.has(id)) return false;
    // Eliminar aristas conectadas
    this.adjList.get(id).forEach(nb => {
      this.adjList.get(nb)?.delete(id);
      this.edges.delete(this._edgeKey(id, nb));
    });
    this.vertices.delete(id);
    this.adjList.delete(id);
    return true;
  }
 
  addEdge(a, b) {
    if (!this.vertices.has(a) || !this.vertices.has(b)) return false;
    if (a === b) return false;
    const key = this._edgeKey(a, b);
    if (this.edges.has(key)) return false;
    this.edges.add(key);
    this.adjList.get(a).add(b);
    this.adjList.get(b).add(a);
    return true;
  }
 
  _edgeKey(a, b) {
    return [a, b].sort().join("-");
  }
 
  // BFS – retorna orden de visita
  bfs(startId) {
    if (!this.vertices.has(startId)) return [];
    const visited = new Set();
    const order   = [];
    const queue   = [startId];
    visited.add(startId);
 
    while (queue.length > 0) {
      const cur = queue.shift();
      order.push(cur);
      this.adjList.get(cur).forEach(nb => {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
        }
      });
    }
    return order;
  }
 
  // DFS – retorna orden de visita
  dfs(startId) {
    if (!this.vertices.has(startId)) return [];
    const visited = new Set();
    const order   = [];
 
    const dfsRec = (id) => {
      visited.add(id);
      order.push(id);
      this.adjList.get(id).forEach(nb => {
        if (!visited.has(nb)) dfsRec(nb);
      });
    };
    dfsRec(startId);
    return order;
  }
 
  clear() {
    this.vertices.clear();
    this.edges.clear();
    this.adjList.clear();
  }
}
 
 
/* GRAFOS – VISUALIZACIÓN CON CANVAS*/
 
const graphCanvas = document.getElementById("graphCanvas");
const graphCtx    = graphCanvas.getContext("2d");
const graphLog    = document.getElementById("graphLog");
const graphInfoEl = document.getElementById("graphInfo");
const graph       = new Graph();
 
let graphHighlight = {}; // id → color
let graphAnimTimer = null;
 
// Drag state
let draggingId  = null;
let dragOffX    = 0;
let dragOffY    = 0;
 
function resizeGraphCanvas() {
  const wrap = graphCanvas.parentElement;
  graphCanvas.width  = wrap.clientWidth;
  graphCanvas.height = Math.max(wrap.clientHeight - 50, 400);
  drawGraph();
}
 
function logGraph(msg, type = "") {
  const p = document.createElement("p");
  p.className = `log-entry ${type}`;
  p.textContent = `> ${msg}`;
  graphLog.querySelector(".log-placeholder")?.remove();
  graphLog.insertBefore(p, graphLog.firstChild);
  if (graphLog.children.length > 30) graphLog.removeChild(graphLog.lastChild);
}
 
function drawGraph() {
  const W = graphCanvas.width;
  const H = graphCanvas.height;
  graphCtx.clearRect(0, 0, W, H);
 
  if (graph.vertices.size === 0) {
    graphCtx.fillStyle = "rgba(107,114,128,0.5)";
    graphCtx.font = "16px 'Syne', sans-serif";
    graphCtx.textAlign = "center";
    graphCtx.fillText("El grafo está vacío. Agrega nodos.", W / 2, H / 2);
    graphInfoEl.textContent = "Grafo vacío";
    return;
  }
 
  // Aristas
  graph.edges.forEach(key => {
    const [a, b] = key.split("-");
    const va = graph.vertices.get(a);
    const vb = graph.vertices.get(b);
    if (!va || !vb) return;
 
    const hlA = graphHighlight[a];
    const hlB = graphHighlight[b];
    let edgeColor = "rgba(139,92,246,0.25)";
    if ((hlA === "visited" || hlA === "highlight") && (hlB === "visited" || hlB === "highlight")) {
      edgeColor = "rgba(59,130,246,0.7)";
    }
 
    graphCtx.beginPath();
    graphCtx.moveTo(va.x, va.y);
    graphCtx.lineTo(vb.x, vb.y);
    graphCtx.strokeStyle = edgeColor;
    graphCtx.lineWidth = 2;
    graphCtx.stroke();
  });
 
  // Nodos
  graph.vertices.forEach((v) => {
    const color = graphHighlight[v.id] || "default";
    let fill   = "#111827";
    let stroke = "#8B5CF6";
    let text   = "#E5E7EB";
 
    if (color === "highlight") { fill = "#1e1a3a"; stroke = "#8B5CF6"; graphCtx.shadowBlur = 16; graphCtx.shadowColor = "#8B5CF6"; }
    if (color === "visited")   { fill = "#0d1f3a"; stroke = "#3B82F6"; text = "#3B82F6"; graphCtx.shadowBlur = 10; graphCtx.shadowColor = "#3B82F6"; }
    if (color === "start")     { fill = "#062030"; stroke = "#06B6D4"; text = "#06B6D4"; graphCtx.shadowBlur = 16; graphCtx.shadowColor = "#06B6D4"; }
 
    const R = 24;
    graphCtx.beginPath();
    graphCtx.arc(v.x, v.y, R, 0, Math.PI * 2);
    graphCtx.fillStyle = fill;
    graphCtx.fill();
    graphCtx.strokeStyle = stroke;
    graphCtx.lineWidth = 2.5;
    graphCtx.stroke();
    graphCtx.shadowBlur = 0;
 
    graphCtx.fillStyle = text;
    graphCtx.font = "bold 12px 'Space Mono', monospace";
    graphCtx.textAlign = "center";
    graphCtx.textBaseline = "middle";
    graphCtx.fillText(v.id, v.x, v.y);
  });
 
  graphInfoEl.textContent = `Vértices: ${graph.vertices.size}  |  Aristas: ${graph.edges.size}  |  Lista de adyacencia mostrada en log`;
}
 
function animateGraphTraversal(order, label) {
  clearTimeout(graphAnimTimer);
  graphHighlight = {};
  if (order.length === 0) return;
  graphHighlight[order[0]] = "start";
  drawGraph();
 
  let i = 1;
  function step() {
    if (i > 1) graphHighlight[order[i - 1]] = "visited";
    if (i < order.length) {
      graphHighlight[order[i]] = "highlight";
      drawGraph();
      i++;
      graphAnimTimer = setTimeout(step, 600);
    } else {
      drawGraph();
      setTimeout(() => { graphHighlight = {}; drawGraph(); }, 2500);
    }
  }
  setTimeout(step, 400);
}
 
// Posición aleatoria dentro del canvas
function randomPos() {
  const W = graphCanvas.width  || 500;
  const H = graphCanvas.height || 400;
  return {
    x: 60 + Math.random() * (W - 120),
    y: 60 + Math.random() * (H - 120),
  };
}
 
// Eventos grafos
document.getElementById("btnAddNode").addEventListener("click", () => {
  const id = document.getElementById("graphNodeInput").value.trim().toUpperCase();
  if (!id) { logGraph("Ingresa un nombre de nodo", "error"); return; }
  const pos = randomPos();
  const ok = graph.addVertex(id, pos.x, pos.y);
  if (ok) { drawGraph(); logGraph(`Nodo '${id}' agregado`); }
  else logGraph(`El nodo '${id}' ya existe`, "warn");
  document.getElementById("graphNodeInput").value = "";
});
 
document.getElementById("btnAddEdge").addEventListener("click", () => {
  const from = document.getElementById("graphEdgeFrom").value.trim().toUpperCase();
  const to   = document.getElementById("graphEdgeTo").value.trim().toUpperCase();
  if (!from || !to) { logGraph("Ingresa ambos nodos para la arista", "error"); return; }
  const ok = graph.addEdge(from, to);
  if (ok) { drawGraph(); logGraph(`Arista '${from}' — '${to}' agregada`); }
  else if (!graph.vertices.has(from) || !graph.vertices.has(to)) logGraph("Uno o ambos nodos no existen", "error");
  else logGraph(`La arista '${from}' — '${to}' ya existe`, "warn");
  document.getElementById("graphEdgeFrom").value = "";
  document.getElementById("graphEdgeTo").value = "";
});
 
document.getElementById("btnDelNode").addEventListener("click", () => {
  const id = document.getElementById("graphDelNode").value.trim().toUpperCase();
  if (!id) { logGraph("Ingresa el nombre del nodo", "error"); return; }
  const ok = graph.removeVertex(id);
  if (ok) { drawGraph(); logGraph(`Nodo '${id}' eliminado`); }
  else logGraph(`El nodo '${id}' no existe`, "error");
  document.getElementById("graphDelNode").value = "";
});
 
document.getElementById("btnBFS").addEventListener("click", () => {
  const start = document.getElementById("graphStart").value.trim().toUpperCase();
  if (!start || !graph.vertices.has(start)) { logGraph(`Nodo de inicio '${start}' no existe`, "error"); return; }
  const order = graph.bfs(start);
  animateGraphTraversal(order, "BFS");
  logGraph(`BFS desde '${start}': [${order.join(" → ")}]`);
 
  // Mostrar lista de adyacencia
  let adj = "Adyacencia: ";
  graph.vertices.forEach((v, id) => {
    adj += `${id}:[${[...graph.adjList.get(id)].join(",")}] `;
  });
  logGraph(adj);
});
 
document.getElementById("btnDFS").addEventListener("click", () => {
  const start = document.getElementById("graphStart").value.trim().toUpperCase();
  if (!start || !graph.vertices.has(start)) { logGraph(`Nodo de inicio '${start}' no existe`, "error"); return; }
  const order = graph.dfs(start);
  animateGraphTraversal(order, "DFS");
  logGraph(`DFS desde '${start}': [${order.join(" → ")}]`);
});
 
document.getElementById("btnGraphSample").addEventListener("click", () => {
  graph.clear();
  graphHighlight = {};
  clearTimeout(graphAnimTimer);
  const W = graphCanvas.width || 600;
  const H = graphCanvas.height || 400;
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.33;
  const ids = ["A","B","C","D","E","F"];
  ids.forEach((id, i) => {
    const angle = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
    graph.addVertex(id, cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  });
  [["A","B"],["A","C"],["B","D"],["C","D"],["D","E"],["E","F"],["F","A"],["B","F"]].forEach(([a,b]) => graph.addEdge(a, b));
  drawGraph();
  logGraph("Grafo de ejemplo cargado: A-B-C-D-E-F con aristas");
});
 
document.getElementById("btnGraphClear").addEventListener("click", () => {
  graph.clear();
  graphHighlight = {};
  clearTimeout(graphAnimTimer);
  drawGraph();
  logGraph("Grafo limpiado");
});
 
// Drag & drop en el canvas del grafo
function getCanvasPos(e) {
  const rect = graphCanvas.getBoundingClientRect();
  const scaleX = graphCanvas.width  / rect.width;
  const scaleY = graphCanvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}
 
function findVertexAt(x, y) {
  let found = null;
  graph.vertices.forEach((v, id) => {
    const dx = v.x - x, dy = v.y - y;
    if (Math.sqrt(dx*dx + dy*dy) < 26) found = id;
  });
  return found;
}
 
graphCanvas.addEventListener("mousedown", e => {
  const pos = getCanvasPos(e);
  draggingId = findVertexAt(pos.x, pos.y);
  if (draggingId) {
    const v = graph.vertices.get(draggingId);
    dragOffX = pos.x - v.x;
    dragOffY = pos.y - v.y;
  }
});
graphCanvas.addEventListener("mousemove", e => {
  if (!draggingId) return;
  const pos = getCanvasPos(e);
  const v = graph.vertices.get(draggingId);
  if (v) { v.x = pos.x - dragOffX; v.y = pos.y - dragOffY; drawGraph(); }
});
graphCanvas.addEventListener("mouseup",   () => { draggingId = null; });
graphCanvas.addEventListener("mouseleave",() => { draggingId = null; });
 
// Touch support
graphCanvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const t = e.touches[0];
  const pos = getCanvasPos(t);
  draggingId = findVertexAt(pos.x, pos.y);
  if (draggingId) { const v = graph.vertices.get(draggingId); dragOffX = pos.x - v.x; dragOffY = pos.y - v.y; }
}, { passive: false });
graphCanvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!draggingId) return;
  const pos = getCanvasPos(e.touches[0]);
  const v = graph.vertices.get(draggingId);
  if (v) { v.x = pos.x - dragOffX; v.y = pos.y - dragOffY; drawGraph(); }
}, { passive: false });
graphCanvas.addEventListener("touchend", () => { draggingId = null; });
 
 
/* ══════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════ */
window.addEventListener("resize", () => {
  const active = document.querySelector(".section.active");
  if (active?.id === "arboles") resizeTreeCanvas();
  if (active?.id === "grafos")  resizeGraphCanvas();
});
 
// Estado inicial: cargar ejemplos al ir a cada módulo por primera vez
let treeInitialized  = false;
let graphInitialized = false;
 
const origGoTo = goTo;
window.goTo = function(id) {
  origGoTo(id);
  if (id === "arboles" && !treeInitialized) {
    treeInitialized = true;
    setTimeout(() => {
      resizeTreeCanvas();
      [50,30,70,20,40,60,80].forEach(v => bst.insert(v));
      drawTree();
      logTree("Árbol de ejemplo precargado. ¡Interactúa con él!");
    }, 100);
  }
  if (id === "grafos" && !graphInitialized) {
    graphInitialized = true;
    setTimeout(() => {
      resizeGraphCanvas();
      document.getElementById("btnGraphSample").click();
    }, 100);
  }
};
 
// Iniciar en hero
goTo("inicio");
 
