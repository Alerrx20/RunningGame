import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { log } from 'three/examples/jsm/nodes/Nodes.js';
import gsap from 'gsap';

function Game() {
  
  useEffect(() => {
    //const scene = new THREE.Scene();
    /* const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(4.61, 2.74, 8); */

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //const controls = new OrbitControls(camera, renderer.domElement);

    //Custom Class
    class Box extends THREE.Mesh {
      velocity: any;
      width: any;
      height: any;
      depth: any;
      right: number;
      left: number;
      bottom: number;
      top: number;
      front: number;
      back: number;
      gravity: number;
      zAcceleration: boolean;

      constructor({ width, height, depth, color = '#00ff00', 
      velocity = {x: 0, y: 0, z: 0},
      position = {x: 0, y: 0, z: 0},
      zAcceleration = false
    }: any) {
        super(
          new THREE.BoxGeometry(width, height, depth), 
          new THREE.MeshStandardMaterial({ color })
        );
          this.width = width;
          this.height = height;
          this.depth = depth;
          
          this.position.set(position.x, position.y, position.z);

          this.right = this.position.x + this.width / 2;
          this.left = this.position.x - this.width / 2;

          this.bottom = this.position.y - this.height / 2;
          this.top = this.position.y + this.height / 2;

          this.front = this.position.z + this.depth / 2;
          this.back = this.position.z - this.depth / 2;

          this.velocity = velocity;
          this.gravity = -0.002;

          this.zAcceleration = zAcceleration;
      }

      updatedSides() {
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;

        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;

        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;
      }

      updated(ground: any) {
        this.updatedSides();

        if(this.zAcceleration) this.velocity.z += 0.001;

        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        this.applyGravity(ground);
      }

      applyGravity(ground: any) {
        this.velocity.y += this.gravity;

        //This is where we hit the ground
        if (boxCollision({ box1: this, box2: ground })) {
          const friction = 0.5;
          this.velocity.y *= friction;
          this.velocity.y = -this.velocity.y;
        } else {
          this.position.y += this.velocity.y;
        }
      }

    }

    function boxCollision({ box1, box2 }: any) {
      //Detection collision on the x axis
      console.log("box2------");
      console.log(box2);
      console.log(box2.top);

      const xCollision = box1.right >= box2.left && box1.left <= box2.right; // X collision
      const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom; // Y collision
      const zCollision = box1.front >= box2.back && box1.back <= box2.front; // Z collision

      return xCollision && yCollision && zCollision;
    }


    function modelUpdated(model: any) {
      modelUpdatedSides(model);

      model.bottom = model.position.y - model.scale.y / 2;
      model.top = model.position.y + model.scale.y / 2;
      
      model.position.x += model.velocity.x;
      model.position.z += model.velocity.z;
      modelApplyGravity(model);
    }

    function modelUpdatedSides(model: any) {
      model.right = model.position.x + model.width / 2;
      model.left = model.position.x - model.width / 2;

      model.bottom = model.position.y - model.height / 2;
      model.top = model.position.y + model.height / 2;

      model.front = model.position.z + model.depth / 2;
      model.back = model.position.z - model.depth / 2;
    }

    function modelApplyGravity(model: any) {
      model.velocity.y += model.gravity;

      //This is where we hit the ground
      if (boxCollision({ box1: model, box2: tubeMesh })) {
        const friction = 0.5;
        model.velocity.y *= friction;
        model.velocity.y = -model.velocity.y;
      } else {
        model.position.y += model.velocity.y;
      }
    }

    // Crear una instancia del cargador GLTFLoader
    const loader = new GLTFLoader();

    let model: any;
    let mixer: any;
    let animationAction: any;
    // Cargar el modelo GLTF
    loader.load('/ninja_run/scene.gltf', (gltf) => {
      console.log("Carga el tal");
      
      model = gltf.scene;
      
      model.scale.set(0.00015, 0.00015, 0.00015);
      
      model.width = model.scale.x;
      model.height = model.scale.y;
      model.depth = model.scale.z;

      model.right = model.position.x + model.width / 2;
      model.left = model.position.x - model.width / 2;

      model.bottom = model.position.y - model.scale.y / 2;
      model.top = model.position.y + model.scale.y / 2;

      model.front = model.position.z + model.depth / 2;
      model.back = model.position.z - model.depth / 2;
      
      model.velocity = {x: 0, y: 0, z: 0};
      model.gravity = -0.002;
      
      scene.add(model);

      const animationClip = THREE.AnimationClip.findByName(gltf.animations, 'Take 001');
      if (animationClip) {
        mixer = new THREE.AnimationMixer(model);
        animationAction = mixer.clipAction(animationClip);
        animationAction.play();
      }

      // Posiciona el modelo en la escena si es necesario
      model.rotation.set(0, Math.PI / 2, 0);
      model.position.set(0,-0.02,0.5);
    });

    const cube = new Box({ width: 1, height: 1, depth: 1, velocity: { x: 0, y: -0.01, z: 0 }});
    cube.castShadow = true;
    //scene.add(cube);
        
    const ground = new Box({ width: 10, height: 0.5, depth: 50, color: '#0369a1',
      position: { x: 0, y: -2, z: 0}
    });
    ground.receiveShadow = true;
    //scene.add(ground);

    /* const light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    light.position.y = 3;
    light.position.z = 1;
    light.castShadow = true; */

    const keys = {
      a: {
        pressed: false
      },
      d: {
        pressed: false
      },
      s: {
        pressed: false
      },
      w: {
        pressed: false
      }
    }

    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyA':
          keys.a.pressed = true;
          break;
        case 'KeyD':
          keys.d.pressed = true;
          break;
        case 'Space':
          model.velocity.y = 0.1;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyA':
          keys.a.pressed = false;
          break;
        case 'KeyD':
          keys.d.pressed = false;
          break;
      }
    });

    // Responsive camera and canvas
    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // Actualiza el tamaño del renderizador
      renderer.setSize(newWidth, newHeight);

      // Actualiza la relación de aspecto de la cámara
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    });

    const enemies = [];
    
    // Prueba tubo
    let ww = window.innerWidth;
    let wh = window.innerHeight;
    let isMobile = ww < 500;
    let speed = 1;
    let prevTime = 0;

    let mouse = {
      position: new THREE.Vector2(ww * 0.5, wh * 0.7),
      ratio: new THREE.Vector2(0, 0),
      target: new THREE.Vector2(ww * 0.5, wh * 0.7)
    };
    renderer.setSize(ww, wh);

    const camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 100);
    camera.rotation.y = Math.PI;
    camera.position.z = 0.35;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000d25, 0.05, 1.6);

    var light = new THREE.HemisphereLight( 0xe9eff2, 0x01010f, 1 );
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);

    var points = [];
    for (var i = 0; i < 5; i += 1) {
        points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
    }
    points[4].y = -0.06;
    
    var curve = new THREE.CatmullRomCurve3(points);
    var tubeGeometry = new THREE.TubeGeometry(curve, 70, 0.02, 50, false);
    var tubeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,
      color:0xffffff  , wireframe: true  });
    
    var tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);

    const onResize = () => {
      ww = window.innerWidth;
      wh = window.innerHeight;
      
      isMobile = ww < 500;

      camera.aspect = ww / wh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, wh);
    };

    const onMouseMove = function(e: any) {
      if (e.type === "mousemove"){
        mouse.target.x = e.clientX;
        mouse.target.y = e.clientY;
      } else {
        mouse.target.x = e.touches[0].clientX;
        mouse.target.y = e.touches[0].clientY;
      }
    };

    const onMouseDown = () => {
      let mousedown = true;
      if (scene.fog) gsap.to(scene.fog.color, { duration: 0.6, r: 1, g: 1, b: 1 });
      gsap.to(tubeMaterial.color, { duration: 0.6, r: 0, g: 0, b: 0 });
    }
    
    const onMouseUp = function() {
      let mousedown = false;
      if (scene.fog) gsap.to(scene.fog.color, { duration: 0.6, r: 0, g: 0.050980392156862744, b:0.1450980392156863 });
      gsap.to(tubeMaterial.color, { duration: 0.6, r: 1, g: 1, b: 1 });
    };
    
    window.addEventListener('resize', onResize, false);
    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('touchmove', onMouseMove, false);
/*     document.body.addEventListener('touchstart', onMouseDown, false);
    document.body.addEventListener('mousedown', onMouseDown, false);
    document.body.addEventListener('mouseup', onMouseUp, false);
    document.body.addEventListener('mouseleave', onMouseUp, false);
    document.body.addEventListener('touchend', onMouseUp, false);
    window.addEventListener('mouseout', onMouseUp, false); */

    let targetPosition = { x: 0.50, y: 0.50 };

    const updateCameraPosition = (x :number, y :number) => {
      mouse.position.x += (mouse.target.x - mouse.position.x) / 30;
      mouse.position.y += (mouse.target.y - mouse.position.y) / 30;
      
      mouse.ratio.x = (mouse.position.x / ww);
      mouse.ratio.y = (mouse.position.y / wh);
      //console.log("ratiox",x);
      //onsole.log("ratioy",y);
      
      /* camera.rotation.z = ((mouse.ratio.x) * 1 - 0.05);
      camera.rotation.y = Math.PI - (mouse.ratio.x * 0.3 - 0.15);
      camera.position.x = ((mouse.ratio.x) * 0.044 - 0.025);
      camera.position.y = ((mouse.ratio.y) * 0.044 - 0.025); */

      camera.rotation.z = ((x) * 1 - 0.05);
      camera.rotation.y = Math.PI - (x * 0.3 - 0.15);
      camera.position.x = ((x) * 0.044 - 0.025);
      camera.position.y = ((y) * 0.044 - 0.025);
    
    };
    
    const updateCurve = () => {
      curve.points[2].x = 0.6 * (1 - targetPosition.x) - 0.3;
      curve.points[3].x = 0;
      curve.points[4].x = 0.6 * (1 - targetPosition.x) - 0.3;

      curve.points[2].y = 0.6 * (1 - targetPosition.y) - 0.3;
      curve.points[3].y = 0;
      curve.points[4].y = 0.6 * (1 - targetPosition.y) - 0.3;
      var tubeGeometry = new THREE.TubeGeometry(curve, 70, 0.02, 50, false);
      
      /* if (model) {
        const tubeBottom = tubeMesh.position.y - tubeMesh.geometry.parameters.radius;
        console.log("Bottom del tubo:", tubeBottom);
        console.log("Bottom del tubo mesh:", tubeMesh.geometry.parameters.radius);
        
        model.position.y = tubeBottom;
         // Encuentra la posición en la curva para el modelo
          const curvePosition = curve.parameters.path.getPointAt(targetPosition.x);

          // Ajusta la posición del modelo considerando su ancho
          const modelWidth = model.scale.x;
          model.position.x = curvePosition.x - modelWidth / 2;
          model.position.y = curvePosition.y;
          model.position.z = curvePosition.z;

          // Asegúrate de que el modelo no se salga del tubo
          if (model.position.y < tubeBottom) {
            model.position.y = tubeBottom;
          }
      } */


      tubeMesh.geometry.dispose();
      tubeMesh.geometry = tubeGeometry;
    };

    /* window.addEventListener("mousemove", () => {
      curve.points[2].x = 0.6 * (1 - targetPosition.x) - 0.3;
      curve.points[3].x = 0;
      curve.points[4].x = 0.6 * (1 - targetPosition.x) - 0.3;

      curve.points[2].y = 0.6 * (1 - targetPosition.y) - 0.3;
      curve.points[3].y = 0;
      curve.points[4].y = 0.6 * (1 - targetPosition.y) - 0.3;
      var tubeGeometry = new THREE.TubeGeometry(curve, 70, 0.02, 50, false);

      tubeMesh.geometry.dispose();
      tubeMesh.geometry = tubeGeometry;
    }); */

    const clock = new THREE.Clock();
    let frames = 0;
    let spawnRate = 200;

    let time = 0;
    // Animation
    const animate = () => {

      targetPosition.x = 0.4 + 0.2 * Math.sin(time);
      targetPosition.y = 0.5 + 0.2 * Math.cos(time);
      //updateCameraPosition(targetPosition.x,targetPosition.y);
      //updateCurve();
      const animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      time += 0.006;
      //Movement code
      cube.velocity.x = 0;
      cube.velocity.z = 0;
      model.velocity.x = 0;
      model.velocity.z = 0;

      if (keys.a.pressed) model.velocity.x = -0.05;
      else if (keys.d.pressed) model.velocity.x = 0.05;
      
      mixer.update(clock.getDelta()); // Run animation
      //modelUpdated(model); 
      
      //cube.updated(ground);
      
      /* enemies.forEach(enemy => {
        enemy.updated(ground);
        if (boxCollision({box1: model, box2: enemy })) {
          cancelAnimationFrame(animationId);
        }
      }); */

      /* if (frames % spawnRate === 0) {
        if (spawnRate > 20) spawnRate -= 20;

        const enemy = new Box({ width: 1, height: 1, depth: 1, 
          position: { x: (Math.random() - 0.5) * ground.width, y: 0,z: -20 }, velocity: { x: 0, y: 0, z: 0.005 }, 
          color: 'red', zAcceleration: true });
        enemy.castShadow = true;
        scene.add(enemy);
        enemies.push(enemy);
      }
      frames ++; */
    };

    animate();

  }, []);

  return <div style={{ margin: 0 }} />;
};

export default Game;
