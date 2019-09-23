/*<script src="/static/three.min.js"></script>
    <script src="/static/three.module.js"></script>
    <script src="/static/OrbitControls.js"></script>
    <script src="/static/FirstPersonControls.js"></script>
    <script src="/static/PointerLockControls.js"></script>
    
    <script src="/static/OBJLoader.js"></script>
    <script src="/static/MTLLoader.js"></script>
    <script src="https://code.jquery.com/jquery-1.11.1.js"></script>
     */
const THREE = require("three");
const PointerLockControls = require("./libs/PointerLockControls")
const FirstPersonControls = require("./libs/FirstPersonControls")
const OBJLoader = require("./libs/OBJLoader")

const roomCanvas = document.getElementById("map")
        const logBox = $("#logs");

        roomCanvas.width = window.innerWidth - logBox.width();
        roomCanvas.height =  window.innerHeight ;

        function setupSize(){

            console.log("Setting up canvas...");

            context.canvas.width  = $("#map").width();
            context.canvas.height = $("#map").height();

            drawCanvas();
        }
 
        const boxSize = [300, 500, 300];


        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 45, roomCanvas.width / roomCanvas.height, 0.1, 1000 );

        camera.position.x = 0;
        camera.position.y = 50;
        camera.position.z = 300;
        camera.lookAt(new THREE.Vector3(0,  100, 0));

        var renderer = new THREE.WebGLRenderer({canvas: roomCanvas});
        renderer.setSize( roomCanvas.width, roomCanvas.height, false );

        function addControls(){

            // Add camera and orbit control
            /*var controls = new THREE.OrbitControls( camera, renderer.domElement );
            camera.position.set( 0, 100, 150 );
            camera.rotation.order = "YXZ"; // three.js r.65

            controls.update();*/
            
            var controls = new THREE.FirstPersonControls(camera, roomCanvas);
            controls.lookSpeed = 0.2;
            controls.movementSpeed = 40;
            controls.noFly = false;
            controls.lookVertical = true;
            controls.constrainVertical = true;
            controls.verticalMin = 1.0;
            controls.verticalMax = 2.0;
            controls.lon = 270;
            controls.lat = 14;


            /*var controls = new THREE.PointerLockControls(camera, roomCanvas);
            var player = controls.getObject();

            //player.position.set(4.5, 6, 1);

            // camera.rotation.order = 'ZYX';
            scene.add(player)*/
            
            return controls;
        }

        function addGrid(){
            // Add basic box layout and lights
            var geometry = new THREE.BoxGeometry(...boxSize);
            geometry = new THREE.EdgesGeometry(geometry);
            var material = new THREE.LineBasicMaterial( { color: 0xffffff, lineWidth: true } );

            var cube = new THREE.LineSegments( geometry, material );
            scene.add( cube );
        }

        function addGround(){
            

           /* const planeGeo = new THREE.PlaneGeometry(boxSize[0]*2.5, boxSize[2]*2.5);
            const planeMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                //side: THREE.DoubleSide,
                //roughness: 0.3,
                metalness: 0.65,
            });
            const mesh = new THREE.Mesh(planeGeo, planeMat);

            //mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            mesh.rotation.x = Math.PI * -.5;
            mesh.position.y = -boxSize[1]/2;
            scene.add(mesh);*/
        }

        function addAmbienLigth(){
            var light = new THREE.AmbientLight( 0xffffff ); // soft white light
            scene.add( light );
        }


        function getRandom(max, min) {
            let a = Math.random() * (max - min) + min;
            return a;
        }

        function addObjects(){
           
            //var mtlLoader = new THREE.MTLLoader();
            //mtlLoader.load("/static/r1.mtl", function(materials){

              //  materials.preload();

                var loader = new THREE.OBJLoader();
                //loader.setMaterials(materials);
                // load a resource
                loader.load(
                    // resource URL
                    '/static/r1.obj',
                    // called when resource is loaded
                    function ( object ) {

                        object.scale.set(0.05, 0.05, 0.05)
                        scene.add( object );

                    },
                    // called when loading is in progresses
                    function ( xhr ) {

                        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

                    },
                    // called when loading has errors
                    function ( error ) {

                        console.log( 'An error happened' );

                    }
                );

            //})

        }

        var controls = addControls();
        addGround();

        //addGrid();
        addAmbienLigth();
        addObjects();

        addLigth(0xaaaaaa, [0,300,0])
        // Add dynamic lights

        
        

        function rgbtoHex(rgb){

            function singleToHex(n){
                var hex = Number(n).toString(16);

                if(hex.length < 2)
                    hex = "0" + hex;
                
                    return hex;
            }
            return `0x${singleToHex(rgb[0])}${singleToHex(rgb[1])}${singleToHex(rgb[2])}`;
        }

        function toGlobalPosition(position){
            // Transform relative positions to box coordinate space

            const deltaX = boxSize[0]/2;
            const deltaY = boxSize[1]/2  - 220;
            const deltaZ = boxSize[2]/2 + 150;

            const margin = 5;

            return [
                position[0]*boxSize[0] - deltaX, // x = x*size - deltaX
                position[1]*boxSize[1] - deltaY,
                position[2]*boxSize[2] - deltaZ
            ]
        }

        // R1 lights
        for(var ligth in spotLights){

            const obj = spotLights[ligth];
            
            const threeLigth = addLigth(rgbtoHex(obj.color), 
            toGlobalPosition(obj.relativePosition))
            
            spotLights[ligth].obj = threeLigth;
        }

        function addLigth(color, position){
            
            group = new THREE.Group();

            var bulbGeometry = new THREE.SphereGeometry(1, boxSize[1]/4, boxSize[1]/4);
            var bulbLight = new THREE.PointLight(Number(color), 0.1);
            bulbLight.power = 2;
            bulbLight.decay = 4;
            bulbLight.exposure=0.3

            var bulbMat = new THREE.MeshStandardMaterial({
                emissive: color,
                emissiveIntensity: 2,
                color: color,
                //metalness: 0.9,
                roughness: 1
            });

            bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
            bulbLight.position.set(...position);
            bulbLight.castShadow = true;

            group.add(bulbLight)
            scene.add(group);
            group.position.y = 0;
            group.position.z = 0;
            group.position.x = 0;

            return [bulbLight, bulbMat];
        }


        renderer.toneMappingExposure = Math.pow(0.7, 2.0);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        var clock = new THREE.Clock();

        function animate() {

            requestAnimationFrame( animate );

            var delta = clock.getDelta(); // seconds.
            //controls.update(delta);
            controls.update(delta)
            // required if controls.enableDamping or controls.autoRotate are set to true

            renderer.render( scene, camera );

            /*console.log(controls.lon, controls.lat);
            console.log(camera.position.x,camera.position.y,camera.position.z);*/
        }
        animate()


        
        

        /*roomCanvas.addEventListener('keydown',onDocumentKeyDown,false);
        function onDocumentKeyDown(event){
            var VIEW_INCREMENT = 1000;
            event = event || window.event;
            var keycode = event.keyCode;
            console.log(keycode)

            const KEYUP = 38;
            const KEYDOWN = 40;
            const KEYLEFT = 37
            const KEYRIGHT = 39;

            switch(keycode){
                case KEYUP:
                    if ( camera.getRotateX() < 90 ){ // restrict so they cannot look overhead
                        camera.setRotateX( camera.getRotateX() + VIEW_INCREMENT );
                    }
                    break;

                case KEYDOWN:
                    if ( camera.getRotateX() > -90 ){ // restrict so they cannot look under feet
                        camera.setRotateX( camera.getRotateX() - VIEW_INCREMENT );
                    }
                    break;

                case KEYLEFT:
                    camera.setRotateY( camera.getRotateY() + VIEW_INCREMENT );
                    break;

                case KEYRIGHT:
                    camera.setRotateY( camera.getRotateY() - VIEW_INCREMENT );
                    break;
            }
            document.updateProjectionMatrix();

            //roomCanvas.addEventListener('keyup',onDocumentKeyUp,false);
        }
        function onDocumentKeyUp(event){
            //roomCanvas.removeEventListener('keydown',onDocumentKeyDown,false);
        }*/

        // Setup listener

        var socket = io.connect('https://' + document.domain + ':' + location.port + '/simulator', {
            query: sesssionName,
            timeout: 120000
        });
        socket.on('connect', function() {
            console.log("Connected")
        });

        socket.on('disconnect', function() {
            console.log("Disconnected")
        });

        socket.on('single', function(msg) {

            let now = new Date();
            console.log(msg)

            $("#logs").append(`<div><label class='dot'>[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] </label><label class='log'>${JSON.stringify(msg)}</label><div>`);
        
            
                spotLights[msg.id].color = msg.color;
                //console.log(spotLights[msg.id])
                spotLights[msg.id].obj[0].color.setHex(rgbtoHex(msg.color));
                spotLights[msg.id].obj[1].color.setHex(rgbtoHex(msg.color));
                spotLights[msg.id].obj[1].emissive.setHex(rgbtoHex(msg.color));
            

            //enderer.render( scene, camera );
            //renderer.render( scene, camera );
        });