//Array y objeto para antes de guardar en local storage
//let participantes=[];
//let restricciones={};


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
const btnComenzarSorteo=document.getElementById("btnIniciarSorteo");
btnComenzarSorteo.addEventListener("click", comenzarSorteo);




//función para agregar al creador del sorteo
function agregarCreador(){

    const input=document.getElementById("inputCreador");
    const checkboxCreador=document.getElementById("creadorParticipa");

    //traemos el valor del campo y le quitamos espacios en blanco
    const creador=input.value.trim();

    //validamos si el checkbox fue seleccionado
    const checkbox=checkboxCreador.checked;

    if(!creador){

        alert("Indica quien está creando el sorteo");

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

    //si el array de participante ya tiene el nombre que se ingresó
    //mandamos un alert y retornamos
    if(participantes.includes(nombre)){

        alert("Este participante ya está registrado");

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

        alert("No puede restringirse a si mismo");

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
    alert("No se pudo generar un sorteo válido.");

    return null;

}



function comenzarSorteo(){

    const resultado=sorteo();

    if(resultado){

        mostrarResultado(resultado);

    }

}



function mostrarResultado(asignaciones){

    const lista=document.getElementById("listaResultado");

    lista.innerHTML="";

    for(let persona in asignaciones){

        lista.innerHTML+=`

            <li class="list-group-item text-center fs-5">

                🎁 <b>${persona}</b> regala a 👉 <b>${asignaciones[persona]}</b>

            </li>     

        `;

    }

}

// 1. Escuchar el click del botón de guardar detalles
const btnGuardarDetalles = document.getElementById("btnGuardarDetalles");
btnGuardarDetalles.addEventListener("click", guardarDetallesEvento);

// 2. Función para guardar los datos en el objeto global
function guardarDetallesEvento() {
    let evento = obtenerEvento();

    const motivoSelect = document.getElementById("selectMotivo").value;
    const otroMotivo = document.getElementById("otroMotivo").value;
    
    // Si eligió "Otro", usamos el texto del input
    evento.tipoEvento = (motivoSelect === "Otro") ? otroMotivo : motivoSelect;
    evento.fecha = document.getElementById("inputFecha").value;
    evento.presupuesto = document.getElementById("inputPresupuesto").value;

    guardarEvento(evento);
    console.log("Detalles guardados:", evento);
}

// 3. Extra: Lógica para mostrar el input de "Otro" y botones de presupuesto rápido
document.getElementById("selectMotivo").addEventListener("change", function() {
    const inputOtro = document.getElementById("otroMotivo");
    if (this.value === "Otro") {
        inputOtro.classList.remove("d-none");
    } else {
        inputOtro.classList.add("d-none");
    }
});

// Botones de presupuesto rápido
document.querySelectorAll(".btn-pre").forEach(boton => {
    boton.addEventListener("click", function() {
        document.getElementById("inputPresupuesto").value = this.value;
    });
});

function finalizarCapturaYNotificar() {
    // 1. Primero nos aseguramos de capturar los últimos datos de los inputs
    guardarDetallesEvento(); 

    // 2. Creamos el Modal de confirmación dinámicamente con Bootstrap
    // Así no necesitas tener el HTML estático en el index
    const modalHTML = `
        <div class="modal fade" id="modalExito" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center p-4">
                        <div class="display-1 text-success mb-3">✅</div>
                        <h4 class="fw-bold">¡Evento Configurado!</h4>
                        <p class="text-muted">Los datos se han guardado en tu historial local.</p>
                        <hr>
                        <div class="d-grid gap-2">
                            <a href="misEventos.html" class="btn btn-primary">Ir a Mis Eventos</a>
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Seguir aquí</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    // Insertar el modal al final del body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 3. Mostrar el modal usando la API de Bootstrap
    const elementoModal = document.getElementById('modalExito');
    const modalBootstrap = new bootstrap.Modal(elementoModal);
    modalBootstrap.show();

    // Limpiar el modal del DOM cuando se cierre para no acumular basura
    elementoModal.addEventListener('hidden.bs.modal', function () {
        elementoModal.remove();
    });
}