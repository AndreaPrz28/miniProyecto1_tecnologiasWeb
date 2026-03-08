//Array y objeto para antes de guardar en local storage
//let participantes=[];
//let restricciones={};


document.addEventListener("DOMContentLoaded", () => {
    configurarBotonPrincipal();

    //valida que el campo no esté vacio para poder continuar
    const btnAgregarCreador=document.getElementById("btnAgregarCreador");
    btnAgregarCreador.addEventListener("click", agregarCreador);


    //inicia el llamado a la función de agregar participantes
    const btnAgregarParticipante=document.getElementById("btnAgregarParticipante");
    btnAgregarParticipante.addEventListener("click", agregarParticipante);


    //traemos el modal de las restricciones y le pasamos las opciones a los selects
    const modal3 = document.getElementById("exampleModal3");

    modal3.addEventListener("show.bs.modal", () => {

        cargarSelects();
        mostrarRestricciones();

    });


    //cargar restricciones
    const btnAgregarRestricciones=document.getElementById("btnAgregarRestriccion");
    btnAgregarRestricciones.addEventListener("click", agregarRestricciones);


    //iniciamos el sorteo
    // const btnComenzarSorteo=document.getElementById("btnIniciarSorteo");
    // btnComenzarSorteo.addEventListener("click", comenzarSorteo);

    const btnIrARestricciones = document.querySelector('#exampleModal2 .modal-footer .btn-primary');
    btnIrARestricciones.addEventListener('click', () => {
        const evento = obtenerEvento();
        if (evento.participantes.length < 2) {
            Swal.fire("¡Espera!", "Agrega al menos 2 participantes para el sorteo.", "warning");
            return;
        }
        saltarSiguiente('exampleModal2', 'exampleModal3');
    });

    const btnIrAConfig = document.querySelector('#exampleModal3 .modal-footer .btn-primary');
    btnIrAConfig.addEventListener('click', () => {
        saltarSiguiente('exampleModal3', 'modalConfiguracion');
    });

});




//funciones nuevas para manejar toda la información del evento en un solo objeto
//este objeto contendrá organizador, participantes, restricciones, tipo de evento, fecha y presupuesto
function obtenerEvento(){

    const eventoGuardado = localStorage.getItem("evento");

    //si no existe nada en localStorage creamos la estructura base del evento
    if(!eventoGuardado){

        return{
            organizador:"",
            participa:false,
            tipoEvento:"",
            fecha:"",
            presupuesto:"",
            participantes:[],
            restricciones:{}
        };

    }

    return JSON.parse(eventoGuardado);

}


//función para guardar el objeto evento completo en localStorage
function guardarEvento(evento){

    localStorage.setItem("evento", JSON.stringify(evento));

}


//función auxiliar para obtener participantes desde el objeto evento
function obtenerParticipantes(){

    const evento = obtenerEvento();

    return evento.participantes;

}


//función auxiliar para obtener restricciones desde el objeto evento
function obtenerRestricciones(){

    const evento = obtenerEvento();

    return evento.restricciones;

}









//función para agregar al creador del sorteo
function agregarCreador(){

    const input=document.getElementById("inputCreador");
    const checkboxCreador=document.getElementById("creadorParticipa");

    //traemos el valor del campo y le quitamos espacios en blanco
    const creador=input.value.trim();

    //validamos si el checkbox fue seleccionado
    const checkbox=checkboxCreador.checked;

    if(!creador){
        Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "Debes agregar un responsable."
        });
        return;
    }

    //traemos los datos del evento desde local storage
    let evento=obtenerEvento();

    console.log(evento);

    //si el checkbox fue seleccionado incluimos al creador
    if(checkbox){

        if(!evento.participantes.includes(creador)){

            evento.participantes.push(creador);

        }

    }

    //guardamos organizador y si participa
    evento.organizador=creador;
    evento.participa=checkbox;

    //guardamos nuevamente el objeto evento en localStorage
    guardarEvento(evento);

    console.log(evento)

    //imprimimos en pantalla el nombre del participante
    actualizarLista();

    //Saltamos al siguiente modal
    saltarSiguiente('exampleModal', 'exampleModal2');
}



function agregarParticipante(){

    //traemos los datos del modal y quitamos espacios en blanco
    const input = document.getElementById("inputParticipante");
    const nombre= input.value.trim();

    //si el campo está vacio, retoramos
    if(nombre==="") return;

    //recuperamos la info del evento desde localStorage
    let evento=obtenerEvento();
    
    const participantes=evento.participantes;
    console.log(participantes);
    //si el array de participante ya tiene el nombre que se ingresó
    //mandamos un alert y retornamos
    if(participantes.includes(nombre)){

        //alert("Este participante ya está registrado");
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Este participante ya está registrado"
        });


        return;

    }

    //agregamos el nombre del participante al array
    participantes.push(nombre);

    //actualizamos el localStorage con el nuevo participante
    guardarEvento(evento);

    //limpiamos el campo del modal
    input.value="";

    //actualizamos pantalla con el nuevo nombre
    actualizarLista();

}



function actualizarLista(){

    //traemos la lista del modal
    const lista= document.getElementById("listaParticipantes");
    lista.innerHTML="";
    
    //recuperamos participantes
    const participantes= obtenerParticipantes();

    //recorremos el array y agregamos a cada participante junto con un botón para eliminarlo
    //se le añade tambien el evento onclick para eliminarlo
    participantes.forEach((p, index)=>{

        lista.innerHTML+=`

            <li class="list-group-item d-flex justify-content-between">

                ${p}

                <button class="btn btn-sm btn-danger" onclick="eliminarParticipante(${index})">

                    X

                </button>

            </li>

        `;

    });

}



function eliminarParticipante(index){

    //traemos los datos del evento desde localStorage
    let evento=obtenerEvento();

    const participantes=evento.participantes;

    participantes.splice(index,1);
    
    guardarEvento(evento);

    actualizarLista();

}



function cargarSelects(){

    const selectBase= document.getElementById("personaBase");
    const selectRestringida= document.getElementById("personaRestringida");

    selectBase.innerHTML="";
    selectRestringida.innerHTML="";

    const participantes= obtenerParticipantes();

    participantes.forEach(nombre=>{

        selectBase.innerHTML+=`

            <option value="${nombre}">${nombre}</option>    

        `;
        selectRestringida.innerHTML+=`

            <option value="${nombre}">${nombre}</option>    

        `;

    })
}



function agregarRestricciones(){

    const base = document.getElementById("personaBase").value;
    const restringido = document.getElementById("personaRestringida").value;
    
    if(base===restringido){

        //alert("No puede restringirse a si mismo");
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No puede restringirse a si mismo"
        });

        return;

    }

    const evento=obtenerEvento();
    const restricciones=evento.restricciones;

    console.log(restricciones);

    if(!restricciones[base]){

        restricciones[base]=[];

    }

    restricciones[base].push(restringido);

    guardarEvento(evento);

    mostrarRestricciones();

}



function mostrarRestricciones(){

    const lista=document.getElementById("listaRestricciones");
    
    lista.innerHTML="";

    const restricciones=obtenerRestricciones();

    for(let persona in restricciones){

        restricciones[persona].forEach(r=>{

            lista.innerHTML+= `

                <li class="list-group-item">

                    ${persona} no puede sacar a ${r}

                </li>

            `;

        });

    }

}




//funcion que nos ayudará a validar que se cumplan las condiciones del sorteo
function esValido(asignaciones){

    const restricciones=obtenerRestricciones();

    //para cada persona de asignaciones comparamos
    for (let persona in asignaciones){

        //destino será la persona que se le asignó al momento de hacer el shuffle
        let destino = asignaciones[persona];
        
        console.log("Validando:", persona, "->", destino);
        console.log("Restricción:", restricciones[persona]);

        //si la persona asignada es ella misma, retorna falso y no es valida la asignacion 
        if(destino===persona) return false;
        
        //si la persona asignada es la que se encuentra restringida retorna falso y no es valida la asignación
        if(restricciones[persona]?.includes(destino)){

            return false;

        }

    }
    
    //si ninguna de las dos condiciones previas se cumplen, quiere decir que la asignacion es correcta y retorna verdadero
    return true;

}



//función que contiene la logica del sorteo
function sorteo(){

    let intentos= 0;
    let maxIntentos=1000;

    const participantes=obtenerParticipantes();
    const restricciones=obtenerRestricciones();

    while (intentos<maxIntentos){

        //copia del array que no altera el array original
        let copia=[...participantes];

        //algoritmo para asignacion aleatoria (shuffle)
        for(let i=copia.length-1; i>0; i--){

            let j=Math.floor(Math.random()*(i+1));

            [copia[i], copia[j]]= [copia[j], copia[i]]

        }

        //array donde estarán las asignaciones 
        let asignaciones={};

        //para cada persona del array participantes se le asignará la persona que está en copia
        participantes.forEach((persona, index)=>{

            asignaciones[persona]=copia[index];

        })

        //se validan las asignacion con la funcion es valido
        if(esValido(asignaciones)){

            console.log("Restricciones actuales:", restricciones);
            console.log("ASIGNACIÓN FINAL:", asignaciones);

            return asignaciones;

        }

        //si no entra en el if, aumenta el contador
        intentos++;

    }

    //si despues de hacer todos los intentos no nos arroja alguna combinación valida, regresamos un null
    //alert("No se pudo generar un sorteo válido.");
    Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar un sorteo válido."
    });

    return null;

}



function comenzarSorteo(){

    const resultado=sorteo();

    if(resultado){
        mostrarResultado(resultado);
        
        guardarEventoHistorial(resultado);

        const seccionResultado=document.getElementById("seccionResultados");

        if(seccionResultado){
            seccionResultado.scrollIntoView({
                behavior: "smooth"
            });
        }
    }

}


//se elimina por duplicidad
// function mostrarResultado(asignaciones){

//     const lista=document.getElementById("listaResultado");

//     lista.innerHTML="";

//     for(let persona in asignaciones){

//         lista.innerHTML+=`

//             <li class="list-group-item text-center fs-5">

//                 🎁 <b>${persona}</b> regala a 👉 <b>${asignaciones[persona]}</b>

//             </li>     

//         `;

//     }

// }

// 1. Escuchar el click del botón de guardar detalles
// const btnGuardarDetalles = document.getElementById("btnGuardarDetalles");
// btnGuardarDetalles.addEventListener("click", guardarDetallesEvento);


// function obtenerParticipantes(){
//     const evento=obtenerEvento();
//     const participantes=evento.participantes;
//     if(!participantes){
//         return [];
//     }

//     const motivoSelect = document.getElementById("selectMotivo").value;
//     const otroMotivo = document.getElementById("otroMotivo").value;
    
//     // Si eligió "Otro", usamos el texto del input
//     evento.tipoEvento = (motivoSelect === "Otro") ? otroMotivo : motivoSelect;
//     evento.fecha = document.getElementById("inputFecha").value;
//     evento.presupuesto = document.getElementById("inputPresupuesto").value;

//     guardarEvento(evento);
//     console.log("Detalles guardados:", evento);
// }



// function obtenerRestricciones(){
//     const arrayRestricciones=localStorage.getItem("restricciones");
//     if(!arrayRestricciones){
//         return {};
//     }

//     const restricciones=JSON.parse(arrayRestricciones);
//     return restricciones;
// }



// Lógica para el nuevo modal de configuración
let motivoSeleccionado = "";

function setMotivo(valor) {
    motivoSeleccionado = valor;
    // Ponemos el valor en el input oculto por si acaso
    document.getElementById('customMotivo').value = valor;
    
    // Feedback visual: quitamos la clase 'active' de todos y se la ponemos al clicado
    document.querySelectorAll('.btn-motivo').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    
    // El botón que llamamos (evento actual) le cambiamos el color
    event.target.classList.remove('btn-outline-secondary');
    event.target.classList.add('btn-primary');
}



function checkPresupuesto(valor) {
    const inputCustom = document.getElementById('customPresupuesto');
    if(valor === "otro") {
        inputCustom.classList.remove('d-none');
    } else {
        inputCustom.classList.add('d-none');
    }
}



document.getElementById('btnGuardarConfig').addEventListener('click', () => {
    const customMot = document.getElementById('customMotivo').value;
    const fecha = document.getElementById('fechaEvento').value;
    const presupuestoBase = document.getElementById('presupuestoSelect').value;
    const presupuestoFinal = presupuestoBase === "otro" ? document.getElementById('customPresupuesto').value : presupuestoBase;

    if(!fecha || (!motivoSeleccionado && !customMot)) {
        //alert("Por favor rellena la fecha y el motivo.");
        Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "Por favor rellena la fecha y el motivo."
        });
        return;
    }

    const config = {
        evento: customMot || motivoSeleccionado,
        fecha: fecha,
        presupuesto: presupuestoFinal
    };

    localStorage.setItem("configuracion", JSON.stringify(config));
    
    // Ahora sí, cerramos y disparamos el sorteo
    const modalElement = document.getElementById('modalConfiguracion');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    
    comenzarSorteo(); // Tu función que ya tienes
});



// Modificacion de tu funcion mostrarResultado para activar esta seccion
function mostrarResultado(asignaciones) {
    const lista = document.getElementById("listaResultado");
    lista.innerHTML = "";

    for (let persona in asignaciones) {
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${persona} le regala a:</span>
                <span class="badge" style="background-color: var(--color-accent);">${asignaciones[persona]}</span>
            </li>`;
    }

    // Mostrar el contenedor de sugerencias
    const seccion = document.getElementById("seccionSugerencias");
    seccion.classList.remove("d-none");
    
    // Inicializar los eventos de arrastre
    prepararDragAndDrop();
    
    
}



function prepararDragAndDrop() {
    const items = document.querySelectorAll(".item-regalo");
    const destino = document.getElementById("cajaDestino");
    const placeholder = document.getElementById("placeholderTexto");

    items.forEach(item => {
        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", e.target.id);
            e.target.style.opacity = "0.5";
        });

        item.addEventListener("dragend", (e) => {
            e.target.style.opacity = "1";
        });
    });

    destino.addEventListener("dragover", (e) => {
        e.preventDefault();
        destino.style.boxShadow = "inset 0 0 10px var(--color-secundario)";
    });

    destino.addEventListener("dragleave", () => {
        destino.style.boxShadow = "none";
    });

    destino.addEventListener("drop", (e) => {
        e.preventDefault();
        destino.style.boxShadow = "none";
        
        const idRegalo = e.dataTransfer.getData("text");
        const elemento = document.getElementById(idRegalo);
        
        if (placeholder) {
            placeholder.style.display = "none";
        }

        // Mover el elemento y cambiar su color al del acento (naranja)
        destino.appendChild(elemento);
        elemento.style.backgroundColor = "var(--color-accent)";
    });
}



function guardarSugerencias() {
    const seleccionados = [];
    const itemsEnDestino = document.querySelectorAll("#cajaDestino .item-regalo");
    
    itemsEnDestino.forEach(item => {
        seleccionados.push(item.innerText);
    });
    
    if (seleccionados.length === 0) {
        //alert("Selecciona al menos una sugerencia de regalo");
        Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "Selecciona al menos una sugerencia de regalo."
        });
        return;
    }

    // Persistencia en LocalStorage segun requerimiento
    localStorage.setItem("sugerenciasRegalos", JSON.stringify(seleccionados));
    

    //llamamos nueamente a la función que toma el estado del localStorage actualizado
    configurarBotonPrincipal();

    const seccionHero=document.getElementById("seccionHero");

    if(seccionHero){
        seccionHero.scrollIntoView({
            behavior: "smooth"
        });
    }

    //alert("Lista de sugerencias guardada correctamente");
    Swal.fire({
        icon: "success",
        title: "Sorteo generado",
        text: "Lista de sugerencias guardada correctamente.",
        returnFocus: false
    });

}




function configurarBotonPrincipal() {
    const btn = document.getElementById("btnAccionPrincipal");
    const config = localStorage.getItem("configuracion");
    const imagenDefault = document.getElementById("imagenDefault");
    const cardResumen = document.getElementById("cardResumenEvento");

    if (config) {
        // --- ESCENARIO A: YA HAY DATOS (BOTÓN PARA REINICIAR) ---
        btn.textContent = "NUEVO SORTEO";
        btn.style.backgroundColor = "var(--color-accent)";
        btn.style.border = "none";
        
        // Desactivamos el modal de Bootstrap para que no se abra al querer borrar
        btn.removeAttribute("data-bs-toggle");
        btn.removeAttribute("data-bs-target");

        // Mostramos el resumen
        if(imagenDefault) imagenDefault.classList.add("d-none");
        if(cardResumen) {
            cardResumen.classList.remove("d-none");
            const datos = JSON.parse(config);
            llenarCardResumen(datos);
        }

        // Programar la limpieza física
        btn.onclick = function(e) {
            e.preventDefault(); // Evita cualquier comportamiento por defecto
            // if (confirm("¿Quieres borrar todo y empezar de cero?")) {
            //     localStorage.removeItem("configuracion");
            //     localStorage.removeItem("evento");
            //     localStorage.removeItem("sugerenciasRegalos");
            //     window.location.reload(); // Recarga total
            // }
            Swal.fire({
            title: '¿Quieres borrar todo y empezar de cero?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar todo',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Borrar todo
                localStorage.removeItem("configuracion");
                localStorage.removeItem("evento");
                localStorage.removeItem("sugerenciasRegalos");

                // Recargar la página
                window.location.reload();
            }
        });
        };

    } else {
        // --- ESCENARIO B: NO HAY DATOS (EMPEZAR DE CERO) ---
        btn.textContent = "EMPEZAR AHORA";
        btn.style.backgroundColor = "var(--color-primario)";
        btn.style.border = "none";
        
        // IMPORTANTE: Limpiar el evento click manual para que Bootstrap tome el control
        btn.onclick = null; 

        // Activamos los atributos de Bootstrap para abrir el modal
        btn.setAttribute("data-bs-toggle", "modal");
        btn.setAttribute("data-bs-target", "#exampleModal");
        
        if(cardResumen) cardResumen.classList.add("d-none");
        if(imagenDefault) imagenDefault.classList.remove("d-none");
    }
}

function llenarCardResumen(datos) {
    // Usamos validacion opcional (?.) por si los elementos no existen en el DOM todavia
    const titulo = document.getElementById("resumenTitulo");
    const fecha = document.getElementById("resumenFecha");
    const presupuesto = document.getElementById("resumenPresupuesto");
    const regalos = document.getElementById("resumenRegalos");

    if(titulo) titulo.innerText = datos.evento || "Evento";
    if(fecha) fecha.innerText = datos.fecha || "Sin fecha";
    if(presupuesto) presupuesto.innerText = datos.presupuesto || "0";
    

    const regalosGuardados= JSON.parse(localStorage.getItem("sugerenciasRegalos")) || "Sin sugerencias";
    if(regalos){
        regalos.innerText=regalosGuardados.join(", ");
    }

}

function guardarEventoHistorial(resultado){

    const config = JSON.parse(localStorage.getItem("configuracion"));
    const participantes = obtenerParticipantes();
    const ultEvento= obtenerEvento();

    let eventos = JSON.parse(localStorage.getItem("eventosHistorial")) || [];

    const nuevoEvento = {
        id: Date.now(),
        tipoEvento: config?.evento,
        fecha: config?.fecha,
        presupuesto: config?.presupuesto,
        participantes: participantes,
        resultado: resultado,
        organizador: ultEvento.organizador
    };

    eventos.push(nuevoEvento);

    localStorage.setItem("eventosHistorial", JSON.stringify(eventos));

}

function irAlInicio() {
    const seccion = document.getElementById("seccionHero");

    if (seccion) {
        seccion.scrollIntoView({
            behavior: "smooth"
        });
    }
}

//función para tener el control total de los modales
function saltarSiguiente(idActual, idSiguiente) {
    const elActual = document.getElementById(idActual);
    const elSiguiente = document.getElementById(idSiguiente);

    const modalActual = bootstrap.Modal.getInstance(elActual);
    const modalSiguiente = new bootstrap.Modal(elSiguiente);

    if (modalActual) {
        modalActual.hide();
        // Esperamos a que el anterior desaparezca por completo antes de abrir el otro
        elActual.addEventListener('hidden.bs.modal', () => {
            modalSiguiente.show();
        }, { once: true });
    } else {
        modalSiguiente.show();
    }
}