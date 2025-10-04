/* app.js - Módulo controlador siguiendo el patrón Módulo 
* Mantiene estado y expone operaciones usadas por la vista
* Se conecta a los elementos existentes:
* (#author, #getBlueprints, <table>, #nameAuthorSelected, #totalPoints)
*/
const app = (function () {
    // Estado privado 
    let service = null; // apimock o apiclient
    let state = {
        author: null,
        blueprints: [],     // [{name, author, points:[{x,y},...]}]
        selected: null,     // Blueprint selected: {name, author, points:[]} 
        // listado privado {name, pointsCount} 
        summary: []         // [{ name: string, pointsCount: number }]
    };

    /** Validacion de configurar primero el servicio */
    function ensureService() {
        if (!service) throw new Error("Servicio no configurado. Llame a app.setService(svc) primero");
    }

    /** Conteo de los puntos de cada Blueprint que tiene un autor (casa, jardin) */
    function toSummary(list) {
        return (list || []).map(bp => ({
            name: bp.name,
            pointsCount: (bp.points && bp.points.length) || 0
        }));
    }

    /** Utilidad privada para centralizar el cambio de autor y limpiar estado relacionado */
    function setAuthorInternal(authorName) {
        if (!authorName || !authorName.trim()) throw new Error("Autor inválido");
        state.author = authorName.trim();
        state.selected = null;
        state.blueprints = [];
        state.summary = [];
    }

    // controlador publico
    return {
        /** Define el proveedor de datos (apimock/apiclient) */
        setService(svc) { service = svc; return this; },

        /** Define el autor activo y limpia selección */
        setAuthor(authorName) {
            setAuthorInternal(authorName);
            return this;
        },

        /** operación pública para cambiar el autor actualmente seleccionado */
        changeAuthor(authorName) {
            setAuthorInternal(authorName);
            return this;
        },

        /** Snapshot de solo lectura del estado. */
        getState() {
            // devuelve copias para no exponer referencias mutables
            return {
                author: state.author,
                blueprints: state.blueprints.map(b => ({ name: b.name, author: b.author, points: b.points.slice() })),
                selected: state.selected ? { name: state.selected.name, author: state.selected.author, points: state.selected.points.slice() } : null
            };
        },

        /** acceso de solo lectura al nombre del autor sin exponer estado interno */
        getAuthorName() {
            return state.author;
        },

        /** acceso de solo lectura al listado privado {name, pointsCount} devuelve copia */
        getAuthorSummary() {
            return state.summary.map(r => ({ name: r.name, pointsCount: r.pointsCount }));
        },

        /** Carga los blueprints del autor actual y retorna resumen para la tabla */
        loadAuthorBlueprints() {
            ensureService();
            if (!state.author) throw new Error("Autor no configurado. Llame a app.setAuthor(name) primero");
            return new Promise((resolve, reject) => {
                service.getBlueprintsByAuthor(state.author, (list) => {
                    state.blueprints = Array.isArray(list) ? list : [];
                    state.selected = null;
                    // actualiza summary privado
                    state.summary = toSummary(state.blueprints);
                    // devuelve copia segura del summary
                    resolve(this.getAuthorSummary());
                }, (err) => reject(err || new Error("Error mientras se obtenían los blueprints por autor")));
            });
        },

        /** Selecciona un blueprint por nombre y lo guarda en estado */
        selectBlueprintByName(name) {
            ensureService();
            if (!state.author) throw new Error("Autor no configurado. Llame a app.setAuthor(name) primero");
            if (!name) throw new Error("Nombre de blueprint requerido");
            return new Promise((resolve, reject) => {
                service.getBlueprintsByNameAndAuthor(state.author, name, (bp) => {
                    if (!bp) return reject(new Error("Blueprint no encontrado"));
                    state.selected = bp;
                    resolve({ name: bp.name, author: bp.author, points: bp.points.slice() });
                }, (err) => reject(err || new Error("Error mientras se obtenía el blueprint por nombre y autor")));
            });
        },

        /** Total de puntos de todos los planos cargados del autor actual */
        getTotalPoints() {
            // Se calcula desde el summary privado
            return state.summary.reduce((acc, r) => acc + ((r.pointsCount) || 0), 0);
        },

        /** Dibuja un plano dado el autor y el nombre, usando callback del servicio
         *  consulta con service.getBlueprintsByNameAndAuthor(...)
         *  dibuja segmentos consecutivos en un canvas
         *  actualiza o crea el campo donde se muestra el nombre del plano actual
         */
        drawByAuthorAndName(authorName, bpName, canvasId = "bpCanvas") {
            ensureService();
            const author = (authorName || state.author || "").trim();
            if (!author) throw new Error("Autor inválido");
            if (!bpName) throw new Error("Nombre de blueprint requerido");

            // Uso de callback 
            service.getBlueprintsByNameAndAuthor(author, bpName, function (bp) {
                if (!bp) { alert("Blueprint no encontrado"); return; }

                // Mantiene estado coherente
                state.author = author;
                state.selected = bp;

                $("#currentBlueprint").text(bp.name);
                $("#current-blueprint-name").text(`Current blueprint: ${bp.name}`);


                // Asegura el canvas si no existe se crea y dibuja
                let canvas = document.getElementById(canvasId);
                if (!canvas) {
                    const cnv = document.createElement("canvas");
                    cnv.id = canvasId;
                    cnv.width = 600;
                    cnv.height = 400;
                    document.body.appendChild(cnv);
                    canvas = cnv;
                }
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const pts = bp.points || [];
                if (pts.length === 0) return;

                // Si había una animación previa, cancelarla
                if (this._animId) {
                    clearInterval(this._animId);
                    this._animId = null;
                }

                // Ajustes visuales 
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                // comienza en el primer punto y vamos dibujando segmentos independientes
                let i = 1;
                let lastX = pts[0].x;
                let lastY = pts[0].y;

                this._animId = setInterval(() => {
                    if (i >= pts.length) {
                        clearInterval(this._animId);
                        this._animId = null;
                        return;
                    }
                    const p = pts[i];

                    // Dibuja solo este segmento para que se vea el progreso
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();

                    lastX = p.x;
                    lastY = p.y;
                    i++;
                }, 80); //  velocidad 

            }.bind(this), function (err) {
                alert((err && err.message) || "Error obteniendo el blueprint");
            });
        },


        /* Operación pública para actualizar el listado desde un autor.
        * invoca service.getBlueprintsByAuthor(authorName, callback)
        * primer map: { name, pointsCount }
        * segundo map: con jQuery, agregar <tr><td>...</td><td>...</td></tr> al <tbody>
        * reduce: calcular total de puntos y actualizar numero totalPoints con jQuery
        * actualiza el estado privado (author, blueprints, summary)
        */
        updateBlueprintsListByAuthor(authorName) {
            ensureService();
            const author = (authorName || "").trim();
            if (!author) throw new Error("Autor inválido");

            // llama al servicio mock 
            service.getBlueprintsByAuthor(author, (list) => {
                // guarda estado privado interno
                state.author = author;
                state.blueprints = Array.isArray(list) ? list : [];
                state.selected = null;

                // primer map: objetos simples { name, pointsCount }
                const simple = state.blueprints.map(bp => ({
                    name: bp.name,
                    pointsCount: (bp.points && bp.points.length) || 0
                }));

                // Mantiene summary privado
                state.summary = simple;

                //  jQuery: vaciar <tbody> y agregar filas <tr><td>...</td><td>...</td>
                const $table = $("table");
                let $tbody = $table.find("tbody");
                if ($tbody.length === 0) {
                    $tbody = $("<tbody></tbody>").appendTo($table);
                }
                $tbody.empty();

                // Segundo map: crear filas con jQuery 
                simple.map(row => {
                    const $tr = $("<tr></tr>");
                    const $tdName = $("<td></td>").text(row.name);
                    const $tdPts = $("<td></td>").text(row.pointsCount);

                    const $btn = $("<button>Open</button>").on("click", () => {
                        // feedback en el output superior
                        $("#nameAuthorSelected").text(`Author: ${author} | Selected: ${row.name}`);
                        // dibuja en el canvas usando el callback de apimock
                        app.drawByAuthorAndName(author, row.name, "bpCanvas");
                    });
                    const $tdOpen = $("<td></td>").append($btn);

                    $tr.append($tdName, $tdPts, $tdOpen);
                    $tbody.append($tr);
                });

                // reduce: calcular total de puntos sobre list transformado
                const total = simple.reduce((acc, r) => acc + (r.pointsCount || 0), 0);

                // Actualiza DOM con jQuery
                $("#nameAuthorSelected").text(`${author}'s blueprints:`); // encabezado
                $("#totalPoints").text(String(total));                    // total

            }, (err) => {
                console.error(err);
                // Si hay error, limpia la tabla y total para reflejar estado vacío
                const $table = $("table");
                let $tbody = $table.find("tbody");
                if ($tbody.length === 0) $tbody = $("<tbody></tbody>").appendTo($table);
                $tbody.empty();
                $("#nameAuthorSelected").text(`${author}'s blueprints:`);
                $("#totalPoints").text("0");
                state.author = author;
                state.blueprints = [];
                state.summary = [];
                state.selected = null;
            });
        }

    };
})();

/* Conexión a la vista existente
* Se engancha al botón de getBlueprints, lee al author,
* llena la tabla y el total, y agrega botón open por fila
*/
document.addEventListener("DOMContentLoaded", () => {
    // Servicio por defecto: apiclient API real. Si no está disponible, cae a apimock
    try { 
        app.setService(apimock); 
    } catch (e) { 
        console.warn(e); 
        try { app.setService(apiclient); } catch (e2) { console.warn(e2); }
    }

    // Elementos del HTML
    const $btn = document.getElementById("getBlueprints");
    const $author = document.getElementById("author");
    const $table = document.querySelector("table");

    // guarda encabezado y cuerpo para no borrar el header
    let $thead = $table.querySelector("thead");
    let $tbody = $table.querySelector("tbody");

    // Si no hay THEAD, lo creamos y movemos la fila de cabecera la que tiene <th> allí
    if (!$thead) {
        const firstRow = $table.querySelector("tr");
        const hasHeaderCells = firstRow && firstRow.querySelector("th");
        if (hasHeaderCells) {
            $thead = document.createElement("thead");
            // Inserta thead al inicio de la tabla
            $table.insertBefore($thead, $table.firstChild);
            // Mueve la fila de cabecera al thead
            $thead.appendChild(firstRow);
        }
    }

    // Asegurar TBODY para las filas de datos
    if (!$tbody) {
        $tbody = document.createElement("tbody");
        $table.appendChild($tbody);
    }

    // Render helpers 


    // Acción del botón getBlueprints
    $btn.addEventListener("click", async () => {
        const author = ($author.value || "").trim();
        if (!author) return alert("Por favor ingrese un nombre de autor");

        try {
            /** Usar el método existente que devuelve una promesa:
             app.changeAuthor(author);
            const rows = await app.loadAuthorBlueprints(); // [{name, pointsCount}]
            clearRows();
            rows.forEach(r => addRow(r.name, r.pointsCount));
            $nameOut.textContent = `${app.getAuthorName()}'s blueprints:`;
            $totalOut.textContent = String(app.getTotalPoints());*/

            // nuevo listado transformado mediante map 
            app.updateBlueprintsListByAuthor(author);

        } catch (e) {
            console.error(e);
            alert(e.message || e);
        }
    });
});
