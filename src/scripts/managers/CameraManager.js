import * as THREE from 'three';

export default class CameraManager {
    constructor(screenDimensions) {
        this.camera = new THREE.PerspectiveCamera(75, screenDimensions.width / screenDimensions.height, 0.1, 1000);
        
        this.camera.position.set(1, 1, 2);

        this.camera.rotateX(-0.47593466279348795);
        this.camera.rotateY(0.15313096965430942);
        this.camera.rotateZ(0.07846252200141798);
    }

    getCamera() {
        return this.camera;
    }

    updatePerspectiveCamera(screenDimensions) {
        this.perspectiveCamera.aspect = screenDimensions.width / screenDimensions.height;
        this.perspectiveCamera.updateProjectionMatrix();
    }

    enableCameraHelper(sceneManager) {
        this.isCameraHelperEnabled = true;
        this.helper = new THREE.CameraHelper(this.camera);
        sceneManager.scene.add(this.helper);
    }
}