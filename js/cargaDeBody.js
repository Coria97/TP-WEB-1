document.addEventListener("DOMContentLoaded", iniciarPagina);

function iniciarPagina(){
    //Cargo el html index llamando a la funcion cambiarhtml y ademas le paso como parametro la url
    cambiaHtml("index.html");

    //agrego funcionalidad a los botones del nav
    document.querySelector("#navHome").addEventListener("click", function(){cambiaHtml("index.html")});
    document.querySelector("#navPublica").addEventListener("click", function(){ cambiaHtml("publicar.html")});
    document.querySelector("#navPublicaciones").addEventListener("click", function(){cambiaHtml("publicaciones.html")});

    function cambiaHtml(urlHTML) {
        //function que se encarga de cambiar los html segun lo que se pase por parametro
        fetch(urlHTML)
        .then(response => {
            //Con la promesa la imprimo y luego la tranformo con text
            console.log(response);
            response.text().then(text => {
                //luego escribo en el html ese text
                document.querySelector("#contenedor").innerHTML = text;
                if("index.html"==urlHTML)
                    //si entra aca significa que entro al index y tengo que cargar el js de la tabla
                    iniciarIndex();
                else
                    if("publicar.html"==urlHTML)
                        //si entra aca significa que entro al index y tengo que cargar el js del captcha
                        iniciarPublicar();
            });
        });
    } 

    function iniciarIndex() {

        let url ='https://web-unicen.herokuapp.com/api/groups/107coriafumiatti/comentarios';
        let elementosTabla=[{}];
        
        document.querySelector("#agregar").addEventListener("click", agregarComentario);
        document.querySelector("#agregarRapido").addEventListener("click", agregadoRapido);
        document.querySelector("#Filtrar").addEventListener("click", filtrarPalabra);
        document.querySelector("#borrarFiltro").addEventListener("click", function(){event.preventDefault(); imprimeTabla()});

        getInformacion();

        function getInformacion() {
            //Obtengo toda la informacion de la api con GET
            fetch(url,{
                method: "GET",
            }).then(function(r){
                if(!r.ok){
                    console.log("error");
                }
                return r.json();
            }).then(function(json) {
                //Borro lo que hay en la tabla para que no se agregue repetido cuando se auto-Actualize
                elementosTabla.splice(0,elementosTabla.length);
                //recorro el json que retorno la funcion de arriba
                for (let data of json.comentarios) {
                    //por cada posicion de comentarios me llevo los datos que necesito 
                    let dataTabla= {
                        "identificacion":data._id,
                        "nombre" : data.thing.nombre,
                        "apellido" : data.thing.apellido,
                        "comentario" :  data.thing.comentario
                    };
                    //lo inserto en la tabla 
                    elementosTabla.push(dataTabla);
                };
                imprimeTabla();
            }).catch(function(e){
                console.log(e);
            });
            setInterval(getInformacion,10000); // Cada 10 segundos la tabla se auto-Actualiza
        }

        function editarFila(i,id){
            //Creo la variable que va a reemplazar a la actual
            let data = {
                "thing": {
                    "nombre" : document.getElementById("txtFNombre"+i).value,
                    "apellido" : document.getElementById("txtFApellido"+i).value,
                    "comentario" : document.getElementById("txtFComentario"+i).value
                }
            };
            //concateno el url y llamo al metodo PUT para actualizar
            fetch(url+ "/" +id, {
                "method": "PUT",
                "headers": { "Content-Type": "application/json" },
                "body": JSON.stringify(data)
            }).then(function(r){
                if(!r.ok){
                console.log("Error")
                }
                return r.json()
            }).then(function(json){
                    //una vez actualizada la api, actualizo mi tabla
                    elementosTabla[i].nombre= json.person.thing.nombre;
                    elementosTabla[i].apellido= json.person.apellido;
                    elementosTabla[i].comentario= json.person.comentario;
            }).catch(function(e){
                console.log(e)
            })
        }
        
        function borrarFila(posicion,id){
            //Borro el elemento de la tabla y luego la imprimo
            elementosTabla.splice(posicion,1);
            imprimeTabla();
            //concateno la url con el id del elemento que quiero borrar
            //Borro el elemento con el metodo DELETE
            fetch(url+ "/" +id,{
                "method": "DELETE",
                "headers": { "Content-Type": "application/json" }
            }).then(function(r){
                if(!r.ok){
                    console.log("error");
                }
            }).catch(function(e){
                console.log(e);
            });
        }

        function sincroniza(data){
            //agrego la data en la api con POST
            fetch(url, {
                "method": "POST",
                "headers": { "Content-Type": "application/json" },
                "body": JSON.stringify(data)
            }).then(function(r){
                if(!r.ok){
                    //reviso que todo este bien
                    console.log("error");
                }
                return r.json();
            }).then(function(json){
                console.log(json);
                //creo un dato para añadirlo a la tabla
                let dataTabla= { 
                    "identificacion": json.information._id,
                    "nombre" : json.information.thing.nombre,
                    "apellido" : json.information.thing.apellido,
                    "comentario" :  json.information.thing.comentario
                };
                //añado el elemento a la tabla
                elementosTabla.push(dataTabla);
                imprimeTabla();
            }).catch(function(e){
                console.log(e);
            });
        }

        function imprimeTabla() {
            let elem = " ";
            //recorre todo el arreglo 
            for (let i = 0; i < elementosTabla.length; i++) {
                //recopila todos los datos para hacer la tabla
                elem += '<tr id="filtro'+i+'">'+
                            '<td><input type="text" id="txtFNombre'+i+'" value="'+ elementosTabla[i].nombre +'"></td>'+
                            '<td><input type="text" id="txtFApellido'+i+'" value="'+ elementosTabla[i].apellido +'"></td>'+
                            '<td><input type="text" id="txtFComentario'+i+'" value="'+ elementosTabla[i].comentario +'"></td>'+
                            '<td><button class="btnBorrar" type="push" id="' +elementosTabla[i].identificacion+ '">Borrar</button></td>'+
                            '<td><button class="btnEditar" type="push" id="'+ elementosTabla[i].identificacion +'">Editar</button></td>'+
                        '</tr>';
            }
            //agrega la tabla al html
            document.querySelector("#jsBodyTabla").innerHTML = elem;
            //Creo un arreglo de botones para editar
            let arrBtnEditar= document.querySelectorAll(".btnEditar");
            for(let i=0; i < arrBtnEditar.length; i++){
                //recorro la botonera y acada boton le agrego un evento
                arrBtnEditar[i].addEventListener("click", function(){editarFila(i ,arrBtnEditar[i].id)});
            }
            let arrBtnBorrar= document.querySelectorAll(".btnBorrar");
            for(let i=0; i < arrBtnBorrar.length; i++){
                //recorro la botonera y acada boton le agrego un evento
                arrBtnBorrar[i].addEventListener("click", function(){borrarFila(i ,arrBtnBorrar[i].id)});
            }
        }

        function agregarComentario(event){
            //cancelo el evento del boton
            event.preventDefault();
            //creo un elemento con los datos ingresados para añadirlo a la api
            let data = {
                "thing": {
                    "nombre" : document.getElementById("jstxtNombre").value,
                    "apellido" : document.getElementById("jstxtApellido").value,
                    "comentario" : document.getElementById("jstxtComentario").value
                }
            };
            //llamo a sincroniza con el elemento que cree y luego imprimo la tabla
            sincroniza(data);
        }

        function agregadoRapido(event){
            //cancelo el evento del boton
            event.preventDefault();
            //creo tres arreglos para hacer un random y conseguir datos distintos al momento de ingresar
            let auxNombres = ["Santiago","Brian","Soledad","Juan","Matias","Maria","Alejandra",];
            let auxApellidos = ["Coria","Martinez","Lugo","Lazarte","Fumiatti","Correa","Grecco",]; 
            let auxComentarios = ["Excelente servicio","El chofer no llego a tiempo","No llevo mate","La musica no me gusto","Excedia la velocidad","Me hizo pagar el peaje y nunca me devolvio el dinero","No tenia luz derecha el auto",];
            for(let i=0; i<3; i++){
                //creo la variable que va a ser cargada con los valores de los randoms
                let data= {
                    "thing":{
                        "nombre" : auxNombres[Math.floor(Math.random()*7)],
                        "apellido" : auxApellidos[Math.floor(Math.random()*7)],
                        "comentario" : auxComentarios[Math.floor(Math.random()*7)]
                    }
                };
                //agrego el dato a la api y tabla
                sincroniza(data);
            }
        }
        
        function filtrarPalabra (){
            //function que se encargar de filtrar lo que el usuario ingresa en el input 
            event.preventDefault();   
            //variable boolena que se va a utilizar para saber si la palabra hizo match
            let match= false;
            //obtengo lo que el usuario ingreso
            let palabra = document.getElementById("jstxtFiltro").value;
            let m= palabra.length;
            for(let i=0; i < elementosTabla.length; i++){
                //recorro los comentarios y por cada uno busco la palabra que ingresa el usuario
                let comentario = elementosTabla[i].comentario;
                let n = comentario.length;
                for (let s = 0; s <= n-m; s++ ){
                    //s es un int que se va moviendo en el comentario hasta n-m que seria el largo del comentario - largo de la palabra
                    let j=0;
                    for(j=0; j < m; j++){
                        //j es un int que recorre la palabra que ingreso el usuario
                        if (palabra[j] != comentario[s+j])   
                            //va a ir comprobando si la letra en j es igual a s+j
                            break;
                    }
                    if(j==m){
                        //al salir con break o porque termino compruebo si j==m si lo es quiere decir que la palabra coincide
                        //vuelvo match true
                        match=true;
                    }
                }
                //si match es false quiere decir que no encontro la palabra entonces esconodo la fila
                if(!match)
                    document.getElementById("filtro"+i).style.display = 'none';
                else
                //si es true dejo que la fila se muestre y vuelvo match=false
                    match=false;
            }
        }
    }

    function iniciarPublicar() {
        //llama a la funcion generar captcha
        let captcha = generarCaptcha();

        //Asocia la funcion validar al evento submit del elemtno con id #formulario
        const form = document.querySelector("#formulario").addEventListener("submit", validar);

        //Funcion que se encarga de devolverme un numero random entre 1 a 10
        function generaRandom() {
            return Math.floor((Math.random() * 10) + 1);
        }

        //Funcion que se encarga de generar el captcha y imprimpirlo en la pagina web
        function generarCaptcha() {
            let captcha = generaRandom() * 1000 + generaRandom() * 100 + generaRandom() * 10 + generaRandom();
            //Como el captcha es de 4 digitos si supero 10000 lo dividimos entre dos hasta que sea un numero de 4 digitos
            while (captcha >= '10000')
                captcha = Math.floor(captcha / 2);
            //Me trae el elemento p con queryselector al se primer que matchea con #muestracaptcha y imprimo el captcha
            document.querySelector("#muestracaptcha").innerHTML = captcha;
            return captcha;
        }

        //Funcion que se enecargar de verificar que el captcha que ingreso y el que le pedimos que ingrese sean iguales 
        function validar(event) {

            //Extrae lo que ingreso el usuario
            let aValidar = document.getElementById("txtCap").value;
            //lo transforma a un int con la funcion parseInt
            aValidar = parseInt(aValidar);
            if (aValidar !== captcha) {
                //Si son distintos entra al if 
                //Me trae el elemento p con queryselector al se primer que matchea con #muestraResultado y imprimo el captcha
                document.querySelector("#muestraResultado").innerHTML = "El captcha ingresado es erroneo";
                //Cancelamos un evento con event.preventDefault(), esto hara que no se envie el captcha
                event.preventDefault();
                captcha = generarCaptcha();
            }
        }
    }

}