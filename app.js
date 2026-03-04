//Array y objeto para antes de guardar en local storage
//let participantes=[];
//let restricciones={};


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

    //traemos los participantes del local storage
    const participantes=obtenerParticipantes();
    console.log(participantes);
    //si el checkbox fue seleccionado incluimos al creador
    if(checkbox){
        if(!participantes.includes(creador)){
            participantes.push(creador);
            //pasamos al local storage el primer participante
            localStorage.setItem("participantes", JSON.stringify(participantes));  
        }
    }

    console.log(participantes)
    //imprimimos en pantalla el nombre del participante
    actualizarLista();
}





function agregarParticipante(){
    //traemos los datos del modal y quitamos espacios en blanco
    const input = document.getElementById("inputParticipante");
    const nombre= input.value.trim();
    //si el campo está vacio, retoramos
    if(nombre==="") return;

    //recuperamos la info del localStorage
    const participantes=obtenerParticipantes();
    
    //si el array de participante ya tiene el nombre que se ingresó
    //mandamos un alert y retornamos
    if(participantes.includes(nombre)){
        alert("Este participante ya está registrado");
        return;
    }

    //agregamos el nombre del participante al array
    participantes.push(nombre);
    //actualizamos el localStorage con el nuevo participante
    localStorage.setItem("participantes", JSON.stringify(participantes));
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
    const participantes= JSON.parse(localStorage.getItem("participantes")) || [];

    participantes.splice(index,1);
    
    localStorage.setItem("participantes",JSON.stringify(participantes));
    actualizarLista();
}

function cargarSelects(){
    const selectBase= document.getElementById("personaBase");
    const selectRestringida= document.getElementById("personaRestringida");

    selectBase.innerHTML="";
    selectRestringida.innerHTML="";

    const participantes= JSON.parse(localStorage.getItem("participantes")) || [];

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

    const restricciones=obtenerRestricciones();
    console.log(restricciones);
    if(!restricciones[base]){
        restricciones[base]=[];
    }

    restricciones[base].push(restringido);

    localStorage.setItem("restricciones",JSON.stringify(restricciones));

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
            //depurar estos logs
            console.log("Restricciones actuales:", restricciones);
            console.log("ASIGNACIÓN FINAL:", asignaciones);
            return asignaciones;//si todo se cumpla retorna las asignaciones creadas
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
            <li class="list-group-item">
                A ${persona} le toca: ${asignaciones[persona]}
            </li>     
        `;
    }
}


function obtenerParticipantes(){
    const arrayParticipantes=localStorage.getItem("participantes");
    if(!arrayParticipantes){
        return [];
    }

    const participantes=JSON.parse(arrayParticipantes);
    return participantes;
}

function obtenerRestricciones(){
    const arrayRestricciones=localStorage.getItem("restricciones");
    if(!arrayRestricciones){
        return {};
    }

    const restricciones=JSON.parse(arrayRestricciones);
    return restricciones;
}