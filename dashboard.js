// =========================
// CONFIGURACIÓN SUPABASE
// =========================
const SUPABASE_URL = 'https://dutapywxsiuxboqsjqvf.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dGFweXd4c2l1eGJvcXNqcXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTk1MTUsImV4cCI6MjA2OTI5NTUxNX0.SBIDeV_WAWlyLs-ROD1ibXtqqY5bbbh0gouY8gRB9Y4';
    const TABLE = 'cuestionario_comportamiento_proambiental_autosustentabilidad';

    const supabase = supabaseJs.createClient ? supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY) : supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


let chart;

// =========================
// LISTA DE INDICADORES
// =========================
const indicadores = {
  sexo: "Sexo",
  educacion_jefe_hogar: "Educación Jefe Hogar",
  situacion_laboral_jefe_hogar: "Situación Laboral",
  ingreso_mensual_jefe_hogar: "Ingreso Mensual",
  conoce_desechos_solidos: "Conocimiento sobre desechos",
  separar_desechos_por_origen: "Separación por origen",
  clasificacion_correcta_desechos: "Clasificación correcta",
  preocupa_exceso_desechos: "Preocupación por contaminación",
  desechos_contaminan_ambiente: "Desechos contaminan ambiente",
  beneficios_reutilizar_residuo: "Beneficios de reutilizar",
  emprendimientos_reutilizacion_aportan_economia: "Emprendimientos ayudan economía",
};

const selectIndicador = document.getElementById("indicador");
Object.entries(indicadores).forEach(([k, v]) => {
  selectIndicador.innerHTML += `<option value="${k}">${v}</option>`;
});

// =========================
// OBTENER DATOS DE SUPABASE
// =========================
async function obtenerDatos() {
  let query = client
    .from("cuestionario_comportamiento_proambiental_autosustentabilidad")
    .select("*");

  const fi = document.getElementById("fInicio").value;
  const ff = document.getElementById("fFin").value;
  const sexo = document.getElementById("fSexo").value;
  const grupo = document.getElementById("fGrupo").value;
  const sub = document.getElementById("fSubgrupo").value;

  if (fi) query = query.gte("fecha", fi);
  if (ff) query = query.lte("fecha", ff);
  if (sexo) query = query.eq("sexo", sexo);
  if (grupo) query = query.eq("grupo", grupo);
  if (sub) query = query.eq("subgrupo", sub);

  const { data, error } = await query;

  if (error) console.error(error);

  return data || [];
}

// =========================
// GRAFICAR
// =========================
async function actualizar() {
  const datos = await obtenerDatos();
  const indicador = document.getElementById("indicador").value;
  const tipo = document.getElementById("tipoGrafico").value;

  const valores = {};
  datos.forEach(d => {
    const v = d[indicador] || "Sin dato";
    valores[v] = (valores[v] || 0) + 1;
  });

  const labels = Object.keys(valores);
  const cantidad = Object.values(valores);

  const ctx = document.getElementById("grafico").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: tipo,
    data: {
      labels,
      datasets: [{
        label: "Frecuencia",
        data: cantidad,
      }]
    }
  });

  pintarTabla(datos);
  pintarResumen(datos);
}

// =========================
// TABLA
// =========================
function pintarTabla(datos) {
  const head = document.querySelector("#tabla thead");
  const body = document.querySelector("#tabla tbody");

  if (datos.length === 0) {
    head.innerHTML = "<tr><th>No hay datos</th></tr>";
    body.innerHTML = "";
    return;
  }

  const columnas = Object.keys(datos[0]);

  head.innerHTML = "<tr>" + columnas.map(c => `<th class="p-2">${c}</th>`).join("") + "</tr>";
  body.innerHTML = datos.map(row =>
    `<tr>${columnas.map(c => `<td class="p-2 border">${row[c] ?? ""}</td>`).join("")}</tr>`
  ).join("");
}

// =========================
// RESUMEN
// =========================
function pintarResumen(datos) {
  const c = datos.length;
  document.getElementById("resumen").innerHTML = `
    <div class="bg-white p-4 shadow rounded text-center">Registros: <b>${c}</b></div>
    <div class="bg-white p-4 shadow rounded text-center">Hombres: <b>${datos.filter(d => d.sexo === "Masculino").length}</b></div>
    <div class="bg-white p-4 shadow rounded text-center">Mujeres: <b>${datos.filter(d => d.sexo === "Femenino").length}</b></div>
    <div class="bg-white p-4 shadow rounded text-center">Otros: <b>${datos.filter(d => d.sexo !== "Masculino" && d.sexo !== "Femenino").length}</b></div>
  `;
}

// =========================
// EVENTOS
// =========================
["fInicio", "fFin", "fSexo", "fGrupo", "fSubgrupo", "indicador", "tipoGrafico"]
  .forEach(id => document.getElementById(id).addEventListener("change", actualizar));

actualizar();
