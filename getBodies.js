import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const sceneMiddle = new THREE.Vector3(0, 0, 0);
const loader = new GLTFLoader();

function getBody(RAPIER, world) {
    const size = 0.1 + Math.random() * 0.25;
    const range = 6;
    const density = size * 1.0;
    let x = Math.random() * range - range * 0.5;
    let y = Math.random() * range - range * 0.5 + 3;
    let z = Math.random() * range - range * 0.5;

    // Physics
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    let rigid = world.createRigidBody(rigidBodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
    world.createCollider(colliderDesc, rigid);

    // 3D Model
    let mesh = new THREE.Group(); // Temporary empty group; model loads async
    loader.load('https://03-bunny-magnet.vercel.app/rabbit 1k.glb', (gltf) => {
        mesh.add(gltf.scene);
        gltf.scene.scale.set(20, 20, 20); // Scale model to fit each body’s size
    });

    function update() {
        rigid.resetForces(true);
        let { x, y, z } = rigid.translation();
        let pos = new THREE.Vector3(x, y, z);
        let dir = pos.clone().sub(sceneMiddle).normalize();
        rigid.addForce(dir.multiplyScalar(-0.5), true);
        mesh.position.set(x, y, z);
    }

    return { mesh, rigid, update };
}

function getMouseBall(RAPIER, world) {
    const mouseSize = 0.25;
    const geometry = new THREE.IcosahedronGeometry(mouseSize, 8);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
    });
    const mouseLight = new THREE.PointLight(0xffffff, 1);
    const mouseMesh = new THREE.Mesh(geometry, material);
    mouseMesh.add(mouseLight);

    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0);
    let mouseRigid = world.createRigidBody(bodyDesc);
    let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0);
    world.createCollider(dynamicCollider, mouseRigid);

    function update(mousePos) {
        mouseRigid.setTranslation({ x: mousePos.x * 5, y: mousePos.y * 5, z: 0.2 });
        let { x, y, z } = mouseRigid.translation();
        mouseMesh.position.set(x, y, z);
    }
    return { mesh: mouseMesh, update };
}

export { getBody, getMouseBall };
