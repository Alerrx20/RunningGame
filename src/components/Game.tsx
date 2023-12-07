import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Game tunnel https://www.crazygames.com/game/tunnel-runner
const Game: React.FC = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(4.61, 2.74, 8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    //Custom Class
    class Box extends THREE.Mesh {

      constructor({ width, height, depth, color = '#00ff00', 
      velocity = {x: 0, y: 0, z: 0},
      position = {x: 0, y: 0, z: 0},
      zAcceleration = false
    }) {
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

      applyGravity(ground) {
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

    function boxCollision({ box1, box2 }) {
      //Detection collision on the x axis
      const xCollision = box1.right >= box2.left && box1.left <= box2.right; // X collision
      const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom; // Y collision
      const zCollision = box1.front >= box2.back && box1.back <= box2.front; // Z collision

      return xCollision && yCollision && zCollision;
    }

    function modelUpdated(model: any, ground: any) {
      model.bottom = model.position.y - model.scale.y / 2;
      model.top = model.position.y + model.scale.y / 2;
      
      model.position.x += model.velocity.x;
      model.position.z += model.velocity.z;
      modelApplyGravity(model);
    }

    function modelApplyGravity(model: any) {
      model.velocity.y += model.gravity;

      //Here we hit the ground      
      if (model.bottom + model.velocity.y <= ground.top) {
        model.velocity.y *= 0.8;
        model.velocity.y = -model.velocity.y;
      } else {
        model.position.y += model.velocity.y;
      }
    }

    // Crear una instancia del cargador GLTFLoader
    const loader = new GLTFLoader();

    let model;
    let mixer;
    let animationAction;
    let modelBottom;
    // Cargar el modelo GLTF
    loader.load('/ninja_run/scene.gltf', (gltf) => {
      model = gltf.scene;
      
      model.scale.set(0.03, 0.03, 0.03);
      modelBottom = model.position.y - model.scale.y / 2;
      
      model.bottom = model.position.y - model.scale.y / 2;
      model.top = model.position.y + model.scale.y / 2;
      
      model.velocity = {x: 0, y: 0, z: 0};
      model.gravity = -0.002;
      
      scene.add(model);

      const animationClip = THREE.AnimationClip.findByName(gltf.animations, 'Take 001');

      if (animationClip) {
        mixer = new THREE.AnimationMixer(model); // Inicializar el mixer
        animationAction = mixer.clipAction(animationClip);
      }

      // Posiciona el modelo en la escena si es necesario
      model.rotation.set(0, -Math.PI / 2, 0);
      model.position.set(0, 0, 0);
    });

    const cube = new Box({ width: 1, height: 1, depth: 1, velocity: { x: 0, y: -0.01, z: 0 }});
    cube.castShadow = true;
    scene.add(cube);
        
    const ground = new Box({ width: 10, height: 0.5, depth: 50, color: '#0369a1',
    position: { x: 0, y: -2, z: 0}
   });
    ground.receiveShadow = true;
    scene.add(ground);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    light.position.y = 3;
    light.position.z = 1;
    light.castShadow = true;

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
        case 'KeyS':
          keys.s.pressed = true;
          animationAction.play();
          break;
        case 'KeyW':
          keys.w.pressed = true;
          animationAction.play();
          break;
        case 'Space':
          cube.velocity.y = 0.1;
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
        case 'KeyS':
          keys.s.pressed = false;
          animationAction.stop();
          break;
        case 'KeyW':
          keys.w.pressed = false;
          animationAction.stop();
          break;
      }
    });

    
    const enemies = [];
    
    const clock = new THREE.Clock();

    let frames = 0;
    let spawnRate = 200;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);

      //Movement code
      cube.velocity.x = 0;
      cube.velocity.z = 0;
      model.velocity.x = 0;
      model.velocity.z = 0;
      if (keys.a.pressed) cube.velocity.x = -0.05;
      else if (keys.d.pressed) cube.velocity.x = 0.05;
      
      if (keys.s.pressed) cube.velocity.z = 0.05;
      else if (keys.w.pressed) cube.velocity.z = -0.05;
      
      if (keys.s.pressed || keys.w.pressed) {
        mixer.update(clock.getDelta());
      }
      
      cube.updated(ground);
      
      enemies.forEach(enemy => {
        enemy.updated(ground);
        if (boxCollision({box1: cube, box2: enemy })) {
          cancelAnimationFrame(animationId);
        }
      });

      if (frames % spawnRate === 0) {
        if (spawnRate > 20) spawnRate -= 20;

        const enemy = new Box({ width: 1, height: 1, depth: 1, 
          position: { x: (Math.random() - 0.5) * ground.width, y: 0,z: -20 }, velocity: { x: 0, y: 0, z: 0.005 }, 
          color: 'red', zAcceleration: true });
        enemy.castShadow = true;
        scene.add(enemy);
        enemies.push(enemy);
      }
      frames ++;
      //modelUpdated(model, ground);
    };
    animate();

    // Cleanup: remove the DOM element when the component unmounts
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []); // Run the effect once on mount

  return <div style={{ margin: 0 }} />;
};

export default Game;
