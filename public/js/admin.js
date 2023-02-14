function CargarDatos() {
    database.ref().child("users/user_"+uid).get().then((snapshot) => {
        var univelr = snapshot.val().nivel;
        if (univelr == 5) {
            var accordion = '<div class="accordion" id="accordionAdmin">'+
                                '<div class="card">'+
                                    '<div class="card-header" id="headingOne">'+
                                        '<h5 class="mb-0">'+
                                        '<button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">'+
                                            'Semestres'+
                                        '</button>'+
                                        '</h5>'+
                                    '</div>'+
                                    '<div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionAdmin">'+
                                        '<div class="card-body" id="semestres-admin"></div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="card">'+
                                    '<div class="card-header" id="headingTwo">'+
                                        '<h5 class="mb-0">'+
                                        '<button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">'+
                                            'Usuarios'+
                                        '</button>'+
                                        '</h5>'+
                                    '</div>'+
                                    '<div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionAdmin">'+
                                        '<div class="card-body" id="usuarios-admin">'+
                                            '<div class="accordion" id="accordionUsers">'+
                                                '<h4>Clasificación de niveles: </h4>'+
                                                '<div class="user-contents">'+
                                                    '<p>Nivel 1: Permisos para visualizar/añadir/editar los marcadores y el mapa del semestre actual</p>'+
                                                    '<p>Nivel 2: Permisos para borrar marcadores y polígonos</p>'+
                                                    '<p>Nivel 3: Permisos para ver los marcadores de semestres pasados</p>'+
                                                    '<p>Nivel 4: Permisos para ver los mapas de semestres pasados</p>'+
                                                    '<p>Nivel 5: Permisos para Administrador</p>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>';
            $("#contenido-admin").append(accordion);
            semestreAppend = "";
            semestreUserAppend = "";
            database.ref().child("semestres").get().then((snapshot) => {
                if (snapshot.exists()) {
                    semestres = snapshot.val();
                    for (let i = 0; i < semestres["count"]; i++) {
                        semestreAppend += semestres["semestre_"+i]+ (i !== (semestres["count"]-1) ? ', ' : '');
                        semestreUserAppend +=   '<div class="card">'+
                                                    '<div class="card-header" id="semestreUser_'+i+'">'+
                                                        '<h5 class="mb-0">'+
                                                        '<button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseUser_'+i+'" aria-expanded="true" aria-controls="#collapseUser_'+i+'">'+
                                                            semestres["semestre_"+i]+
                                                        '</button>'+
                                                        '</h5>'+
                                                    '</div>'+
                                                    '<div id="collapseUser_'+i+'" class="collapse" aria-labelledby="semestreUser_'+i+'" data-parent="#accordionUsers">'+
                                                        '<div class="card-body">'+
                                                            '<div class="user-content" id="usuariosSemestre_'+ semestres["semestre_"+i] +'"></div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';
                    }
                    $("#semestres-admin").append('<p>Semestres: '+semestreAppend+'</p>');
                    $("#semestres-admin").append('<p>Semestre Actual: '+semestres["semestre_"+(semestres["count"]-1)]+'</p>');
                    $("#semestres-admin").append('<label for="newSemestreInput">Nuevo Semestre: </label><input class="ml-2" type="text" placeholder="Año-Periodo" id="newSemestreInput"><button class="btn btn-success btn-semestre" onclick="NuevoSemestre()">Agregar Nuevo Semestre</button>');
                    $("#accordionUsers").append(semestreUserAppend);

                    userAppend = "";
                    database.ref().child("users").get().then((snapshot1) => {
                        if (snapshot1.exists()) {
                            usuarios = snapshot1.val();
                            for(usuario in usuarios) {
                                const userid = usuario.split("_")[1];
                                userAppend = '<p class ="d-inline-block">'+usuarios[usuario]["name"]+' - '+usuarios[usuario]["email"]+' - '+'</p>';
                                userAppend +=   '<select name="basemaps" id="nivelUser_'+userid+'" class="lista d-inline-block">'+
                                                    '<option value=1>1</option>'+
                                                    '<option value=2>2</option>'+
                                                    '<option value=3>3</option>'+
                                                    '<option value=4>4</option>'+
                                                    '<option value=5>5</option>'+
                                                '</select>';
                                userAppend += '<button class="btn btn-success btn-user d-inline-block" id="btn_'+userid+'" onclick="GuardarUser(id)">Guardar</button><br>';
                                $("#usuariosSemestre_"+usuarios[usuario]["semestre"]).append(userAppend);
                                $("#nivelUser_"+userid).val(usuarios[usuario]["nivel"])
                            }
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
        }
        else{
            $("#contenido-admin").append('<h2>Usted no tiene permisos para ver esta página</h2>'); 
        }
    
      }).catch((error) => {
        console.error(error);
      });
}

function GuardarUser(id) {
    const userid = id.split("_")[1];
    const newLevel = $("#nivelUser_"+userid).val();
    database.ref('users/user_' + userid).update({
        nivel : parseInt(newLevel)
    });
    alert("Nivel de Usuario Guardado");
}

function NuevoSemestre(){
    database.ref().child("semestres").get().then((snapshot) => {
        if (snapshot.exists()){
            const newSemestre = $("#newSemestreInput").val().split(" ").join("");
            if (newSemestre !== "") {
                semestresNew = snapshot.val();
                semestresNew['semestre_' + semestresNew["count"]] = newSemestre;
                semestresNew["count"] = semestresNew["count"]+1;
                database.ref().update({
                    semestres : semestresNew,
                });
                database.ref("geomapas/"+ newSemestre +'/count').set({
                    count : 0,
                });
                database.ref("marcadores/"+ newSemestre +'/count').set({
                    count : 0,
                });
                alert("Nuevo Semestre Agregado");
                location.reload();
            }
        } 
    }).catch((error) => {
        console.error(error);
    });
}