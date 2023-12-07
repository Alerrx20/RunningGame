import React, { useRef, useEffect } from "react";
import * as THREE from "three";

function TubeWithCube() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current! }); // Añadir "!" para verificar que canvasRef.current no es nulo
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Añadir luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Crear el tubo
    var points = [];
    for (var i = 0; i < 5; i += 1) {
        points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
    }
    points[4].y = -0.06;
    const path = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(
      path, 70, 1, 50,
      closed
    );
    const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tube);

    // Crear el cubo
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    // Rotar el cubo dentro del tubo
    const axis = new THREE.Vector3(0, 1, 0); // Eje de rotación
    const angle = Math.PI / 180; // Ángulo de rotación
    let rotation = 0; // Rotación actual del cubo

    function animate() {
      requestAnimationFrame(animate);

      // Rotar el cubo
      cube.rotateOnAxis(axis, angle);

      // Mover el cubo a lo largo del tubo
      const position = tubeGeometry.parameters.path.getPointAt(
        (rotation / (2 * Math.PI)) % 1
      );
      cube.position.copy(position);

      rotation += angle;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      scene.remove(tube);
      scene.remove(cube);
      scene.remove(ambientLight);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}

export default TubeWithCube;