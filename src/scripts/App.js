import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SceneManager from './managers/SceneManager';
import CameraManager from './managers/CameraManager';
import LightManager from './managers/LightManager';
import RendererManager from './managers/RendererManager';
import Ground from './objects/Ground';
import { GUI } from 'dat.gui';

export default class App {
    constructor() {
        window.windowTHREE = THREE;
        window.windowStage = this;
        window.orbitControls = null;

        this.addGUI(); // Add GUI controls for wind strength and wind direction
    }

    addGUI() {
        // Define the carton properties
        const cartonProperties = {
            groundVisible: true, // Default ground visibility
            noOfGrassBlades: 589945, // Default number of grass blades
            groundWidth: 100, // Default width of the carton
            groundHeight: 100, // Default height of the carton
            windStrength: 0.5, // Default wind strength
            grassRotate: true, // Default grass rotation
        };

        // Initialize dat.GUI
        const gui = new GUI();

        // Add controls to GUI for width, height, and length
        gui.add(cartonProperties, "groundWidth", 1.00, 100.00).name("Width").onChange(updateGroundSize.bind(this));
        gui.add(cartonProperties, "groundHeight", 1.00, 100.00).name("Height").onChange(updateGroundSize.bind(this));
        gui.add(cartonProperties, "noOfGrassBlades", 1, 1000000).name("Grass Blades").onChange(updateNoOfGrassBlades.bind(this));
        gui.add(cartonProperties, "windStrength", 0, 1).name("Wind Strength").onChange(updateWindStrength.bind(this));
        gui.add(cartonProperties, "groundVisible", true).name("Ground").onChange(updateGroundVisibility.bind(this));
        gui.add(cartonProperties, "grassRotate", true).name("Grass Rotate").onChange(updateGrassRotation.bind(this));

        // Wrap updateGroundVisibility); to pass cartonProperties
        function updateGroundVisibility() {
            this.updateGroundVisibility(cartonProperties);
        }

        function updateGroundSize() {
            this.updateGroundSize(cartonProperties);
        }

        function updateNoOfGrassBlades() {
            this.updateNoOfGrassBlades(cartonProperties);
        }

        function updateWindStrength() {
            this.updateWindStrength(cartonProperties);
        }

        function updateGrassRotation() {
            this.updateGrassRotation(cartonProperties);
        }
    }

    updateWindStrength(cartonProperties) {
        this.ground.updateWindStrength(cartonProperties.windStrength);
    }

    updateNoOfGrassBlades(cartonProperties) {
        this.ground.updateNoOfGrassBlades(cartonProperties.noOfGrassBlades);
    }

    updateGroundSize(cartonProperties) {
        this.ground.updateSize(cartonProperties.groundWidth, cartonProperties.groundHeight);
    }

    updateGroundVisibility(cartonProperties) {
        if (cartonProperties.groundVisible) {
            this.ground.plane.visible = true;
        } else {
            this.ground.plane.visible = false;
        }
    }

    updateGrassRotation(cartonProperties) {
        this.ground.updateGrassRotation(cartonProperties.grassRotate);
    }

    loadStage(canvas) {
        this.screenDimensions = {
            width: canvas.width,
            height: canvas.height,
        };
        this.sceneManager = new SceneManager();
        this.cameraManager = new CameraManager(this.screenDimensions);
        this.rendererManager = new RendererManager(canvas);
        this.lightManager = new LightManager(this);

        this.ground = new Ground(this);

        this.controls = new OrbitControls(
            this.cameraManager.camera,
            this.rendererManager.renderer.domElement
        );
        window.orbitControls = this.controls;

        this.start();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.rendererManager.render(
            this.sceneManager.scene,
            this.cameraManager.camera
        );
    }

    start() {
        this.animate();
    }
}