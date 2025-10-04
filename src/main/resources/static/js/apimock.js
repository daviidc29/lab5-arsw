// Módulo mock  compatible con callbacks (simula llamadas asíncronas a un backend REST)
apimock = (function () {

  // Estructura de datos de prueba
  var mockdata = [];

  mockdata["johnconnor"] = [
    // Puntos corregidos para que las figuras tengan sentido
    { 
      author: "johnconnor", 
      name: "house", 
      points: [ 
        {x:150,y:250}, {x:250,y:250}, {x:250,y:150}, {x:200,y:100}, 
        {x:150,y:150}, {x:150,y:250} 
      ] 
    },
    { 
      author: "johnconnor", 
      name: "gear",  
      points: [ 
        {x:300,y:200},{x:310,y:190},{x:320,y:200},{x:340,y:200},{x:350,y:190},{x:360,y:200},
        {x:380,y:220},{x:390,y:230},{x:380,y:240},{x:380,y:260},{x:390,y:270},{x:380,y:280},
        {x:360,y:300},{x:350,y:310},{x:340,y:300},{x:320,y:300},{x:310,y:310},{x:300,y:300},
        {x:280,y:280},{x:270,y:270},{x:280,y:260},{x:280,y:240},{x:270,y:230},{x:280,y:220},
        {x:300,y:200}
      ] 
    },
    {
      author: "johnconnor", 
      name: "metro",
      points: [
        {x:20,y:20},{x:60,y:25},{x:100,y:28},{x:140,y:35},{x:180,y:42},
        {x:220,y:46},{x:260,y:50},{x:300,y:55},{x:340,y:60},{x:380,y:65},
        {x:420,y:70},{x:460,y:74},{x:500,y:78},{x:540,y:80},{x:580,y:82}
      ]
    },
    {
      author: "johnconnor", 
      name: "bridge",
      points: [
        {x:50,y:350},{x:440,y:350}, {x:440,y:300},{x:410,y:285},{x:380,y:270},
        {x:350,y:260},{x:320,y:255},{x:290,y:252},{x:260,y:251},{x:230,y:252},
        {x:200,y:255},{x:170,y:260},{x:140,y:270},{x:110,y:280},{x:80,y:290},
        {x:50,y:300},{x:50,y:350}
      ]
    },
    {
      author: "johnconnor", 
      name: "river",
      points: [
        {x:10,y:350},{x:30,y:345},{x:50,y:340},{x:70,y:338},{x:90,y:336},
        {x:110,y:334},{x:130,y:333},{x:150,y:332},{x:170,y:331},{x:190,y:330},
        {x:210,y:329},{x:230,y:328},{x:250,y:327},{x:270,y:326},{x:290,y:325},
        {x:290,y:345},{x:270,y:346},{x:250,y:347},{x:230,y:348},{x:210,y:349},
        {x:190,y:350},{x:170,y:351},{x:150,y:352},{x:130,y:353},{x:110,y:354},
        {x:90,y:356},{x:70,y:358},{x:50,y:360},{x:30,y:365},{x:10,y:370},{x:10,y:350}
      ]
    }
  ];

  mockdata["maryweyland"] = [
    { 
      author: "maryweyland", 
      name: "house2", 
      points: [ 
        {x:100,y:200}, {x:200,y:200}, {x:200,y:100}, {x:150,y:70}, 
        {x:100,y:100}, {x:100,y:200}
      ] 
    },
    { 
      author: "maryweyland", 
      name: "gear2",  
      points: [ 
        {x:100,y:100},{x:110,y:90},{x:120,y:100},{x:140,y:100},{x:150,y:90},{x:160,y:100},
        {x:180,y:120},{x:190,y:130},{x:180,y:140},{x:180,y:160},{x:190,y:170},{x:180,y:180},
        {x:160,y:200},{x:150,y:210},{x:140,y:200},{x:120,y:200},{x:110,y:210},{x:100,y:200},
        {x:80,y:180},{x:70,y:170},{x:80,y:160},{x:80,y:140},{x:70,y:130},{x:80,y:120},
        {x:100,y:100}
      ] 
    },
    {
      author: "maryweyland", 
      name: "labyrinth",
      points: [
        {x:60,y:60},{x:220,y:60},{x:220,y:260},{x:60,y:260},{x:60,y:60},
        {x:80,y:80},{x:80,y:240},{x:200,y:240},{x:200,y:80},{x:80,y:80},
        {x:100,y:100},{x:180,y:100},{x:180,y:220},{x:100,y:220},{x:100,y:100},
        {x:120,y:120},{x:120,y:200},{x:160,y:200},{x:160,y:120},{x:120,y:120}
      ]
    },
    {
      author: "maryweyland", 
      name: "tower",
      points: [
        {x:280,y:340},{x:320,y:340},{x:320,y:100},{x:310,y:100},{x:310,y:70},
        {x:290,y:70},{x:290,y:100},{x:280,y:100},{x:280,y:340}
      ]
    },
    {
      author: "maryweyland", 
      name: "garden2",
      points: [
        {x:100,y:50},{x:120,y:40},{x:140,y:50},{x:120,y:60},{x:100,y:50}, 
        {x:200,y:150},{x:220,y:140},{x:240,y:150},{x:220,y:160},{x:200,y:150},
        {x:80,y:200},{x:100,y:190},{x:120,y:200},{x:100,y:210},{x:80,y:200}
      ]
    }
  ];

  // clonado simple para no exponer referencias mutables
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    /** Devuelve TODOS los planos de un autor */
    getBlueprintsByAuthor: function (authname, callback, error) {
      var data = mockdata[authname];
      if (data) {
        callback(clone(data));
      } else {
        if (typeof error === "function") {
          error(new Error("Author not found: " + authname));
        } else {
          // Para compatibilidad con el uso anterior devolvemos lista vacía
          callback([]);
        }
      }
    },

    /** Devuelve un plano por nombre y autor */
    getBlueprintsByNameAndAuthor: function (authname, bpname, callback, error) {
      var list = mockdata[authname] || [];
      var bp = list.find(function (e) { return e.name === bpname; });
      if (bp) {
        callback(clone(bp));
      } else {
        if (typeof error === "function") {
          error(new Error("Blueprint not found: " + authname + "/" + bpname));
        } else {
          callback(null);
        }
      }
    }
  };

})();