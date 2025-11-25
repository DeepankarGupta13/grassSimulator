import * as THREE from "three";

export default class GrassField {
  constructor(stage, width, height, numBlades, windStrength) {
    this.stage = stage; // Stage object to add the grass field
    this.width = width; // Width of the grass field
    this.height = height; // Height of the grass field
    this.numBlades = numBlades; // Number of grass blades
    this.windStrength = windStrength; // Strength of the wind effect
    this.ifGrassRotate = false; // Rotate the grass blades

    // Initialize wind direction
    this.windDirection = new THREE.Vector2(1, 0); // Initial wind direction

    // Create the grass field
    this.grassMesh = this.createGrassField();
    this.outlineMesh = this.createOutlineMesh(); // Create outline mesh
  }

  createGrassField() {
    const grassGeometry = this.createGrassGeometry();
    const instancedMesh = new THREE.InstancedMesh(
      grassGeometry,
      this.grassMaterial(),
      this.numBlades
    );

    this.setInstanceMatrices(instancedMesh);
    return instancedMesh;
  }

  // TODO: need to create a new vertex shader for the outline mesh
  createOutlineMesh() {
    const grassGeometry = this.createGrassGeometry();
    const outlineMaterial = new THREE.ShaderMaterial({
      vertexShader: this.grassVertexShader(), // Use the same vertex shader
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black color for outlines
        }
      `,
      uniforms: {
        time: { value: 0 }, // Time uniform for wind animation
        windStrength: { value: this.windStrength }, // Wind strength uniform
        windDirection: { value: new THREE.Vector2(1, 0) }, // Wind direction uniform
      },
      side: THREE.DoubleSide,
    });

    const outlineMesh = new THREE.InstancedMesh(
      grassGeometry,
      outlineMaterial,
      this.numBlades
    );

    // Slightly scale up the outline mesh to make it visible behind the grass
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < this.numBlades; i++) {
      if (this.grassIndexPropMap.get(i)) {
        const scale = this.grassIndexPropMap.get(i).scale;
        matrix.makeScale(1, scale, 1);

        const rotationY = this.grassIndexPropMap.get(i).rotationY;
        if (rotationY) matrix.makeRotationY(rotationY);

        const position = this.grassIndexPropMap.get(i).position;
        matrix.setPosition(position.x, position.y, position.z);
      }

      else matrix.makeScale(0.1, 0.1, 0.1); // Scale up by 10%

      outlineMesh.setMatrixAt(i, matrix);
    }

    return outlineMesh;
  }

  createGrassGeometry() {
    const grassGeometry = new THREE.BufferGeometry();

    const numVertices = 15;     // Number of points along the blade's center line
    const slimScale = 10;       // Controls how stretched the sine curve is (smoothness of bending)

    // Each vertex has 3 components: x, y, z
    const vertices = new Float32Array(numVertices * 3);

    // Stores triangle index order (defines how vertices form the mesh surface)
    const indices = [];

    // ----------------------------------------------------------
    // 1. GENERATE VERTICES
    // ----------------------------------------------------------
    for (let i = 0; i < numVertices; i++) {
      /**
       * t is a normalized height factor along the blade.
       * Instead of going from 0 → 1 in 15 steps,
       * we divide further using slimScale = smoother curve.
       *
       * Example: instead of stepping 0 → 1 in 15 steps,
       * we step 0 → 1 in 150 steps (very small increments).
       */
      const t = i / ((numVertices - 1) * slimScale);

      /**
       * y defines the vertical curve of the blade.
       *
       * We use a half sine wave:
       * y = sin( t * slimScale * PI )
       *
       * This gives a natural grass-like arc:
       * - bottom (i=0): y = 0
       * - middle: y = highest point
       * - top: y returns to 0 → slight bend downward
       */
      const y = Math.sin(t * slimScale * Math.PI);

      /**
       * x gives the blade a slight sideward sweep.
       * As t increases, x slowly increases → blade leans sideways.
       */
      const x = t * 0.6;

      const z = 0; // Flat in z-direction; a ribbon-like blade

      // Store vertex position
      vertices[i * 3 + 0] = x;
      vertices[i * 3 + 1] = y;
      vertices[i * 3 + 2] = z;
    }

    // ----------------------------------------------------------
    // 2. CREATE TRIANGLE INDICES (CONNECT THE VERTICES)
    // ----------------------------------------------------------
    /**
     * We connect the vertices in a mirrored fashion:
     *
     * left side: i
     * next left: i + 1
     * right side: numVertices - i - 1
     *
     * This produces "diamond" shaped quads, split into triangles.
     */
    const midPoint = parseInt(numVertices / 2, 10);

    for (let i = 0; i <= midPoint; i++) {
      // First triangle (left → next left → mirrored right)
      indices.push(i, i + 1, numVertices - i - 1);

      // Avoid repeating the center connection
      if (i !== midPoint) {
        // Second triangle (mirrored right → next left → next mirrored right)
        indices.push(
          numVertices - i - 1,
          i + 1,
          numVertices - i - 2
        );
      }
    }

    // ----------------------------------------------------------
    // 3. ASSIGN BUFFERS TO GEOMETRY
    // ----------------------------------------------------------

    // Set positions (typed array of floats)
    grassGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );

    // Set how triangles are formed
    grassGeometry.setIndex(indices);

    return grassGeometry;
  }

  setInstanceMatrices(instancedMesh) {
    this.grassIndexPropMap = new Map();

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < this.numBlades; i++) {
      const x = (Math.random() - 0.5) * this.width;
      const z = (Math.random() - 0.5) * this.height;
      const y = 0;

      const scale = Math.random() * 1;
      matrix.makeScale(1, scale, 1);

      let rotationY = null;
      // Position each grass blade
      if (this.ifGrassRotate) {
        rotationY = Math.random() * Math.PI * 2;
        matrix.makeRotationY(rotationY);
      }
      matrix.setPosition(x, y, z);

      instancedMesh.setMatrixAt(i, matrix);

      this.grassIndexPropMap.set(i, { position: { x, y, z }, scale: scale, rotationY: rotationY ? rotationY : 0 });
    }

  }

  removeGrassField() {
    this.stopAnimation();
    this.stage.sceneManager.remove(this.grassMesh);
    this.stage.sceneManager.remove(this.outlineMesh);
    this.grassMesh.geometry.dispose();
    this.grassMesh.material.dispose();
    this.outlineMesh.geometry.dispose();
    this.outlineMesh.material.dispose();
  }

  setGrassRotate(ifGrassRotate) {
    this.ifGrassRotate = ifGrassRotate;
  }

  // TODO: instead of adding and removing the mesh need to find a way to update the mesh
  // according to new properties
  // we can have the creation of vertices inside vertex shader and update the properties
  // number of grass too
  updateGrassObject() {
    this.removeGrassField();
    this.grassMesh = this.createGrassField();
    this.outlineMesh = this.createOutlineMesh();
    this.stage.sceneManager.add(this.grassMesh);
    this.startAnimation();
  }

  grassMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader: this.grassVertexShader(), // Vertex shader for grass animation
      fragmentShader: this.grassFragmentShader(), // Fragment shader for grass color
      uniforms: {
        time: { value: 0 }, // Time uniform for wind animation
        windStrength: { value: this.windStrength }, // Wind strength uniform
        windDirection: { value: new THREE.Vector2(1, 0) }, // Wind direction uniform
      },
      side: THREE.DoubleSide, // Render both sides of the grass blades
      transparent: true, // Enable transparency for better blending
    });
  }

  // Vertex shader for grass animation
  grassVertexShader() {
    return `
      uniform float time; // Time uniform for wind animation
      uniform float windStrength; // Wind strength uniform
      uniform vec2 windDirection; // Wind direction uniform

      // Function to create a 3x3 rotation matrix around the X-axis
      mat3 rotateX(float angle) {
          return mat3(
              1.0, 0.0, 0.0,
              0.0, cos(angle), -sin(angle),
              0.0, sin(angle), cos(angle)
          );
      }

      varying vec3 vPosition; // Varying variable to pass the position to the fragment shader

      void main() {
          // Get the original position of the vertex
          vec3 pos = position;

          vPosition = pos; // Pass the position to the fragment shader

          // Calculate height percentage (normalized height along the blade)
          float heightPercent = pos.y;
          
          // Random lean for each grass blade (you can pass this as a uniform or generate it)
          float randomLean = sin(time + pos.y) * 0.3; // Example random lean
          
          // Calculate curve amount based on random lean and height percentage
          float curveAmount = sin(randomLean * heightPercent);

          // noise for wind effect
          float noiseSample = sin(((time*0.35) + pos.y));
          
          curveAmount += noiseSample * windStrength;

          // Apply wind direction to the curve amount
          curveAmount *= windDirection.x; // Use windDirection.x to influence the curve

          // Create a 3x3 rotation matrix around the X-axis
          mat3 grassMat = rotateX(curveAmount);

          // Apply the rotation to the grass vertex position
          vec3 grassVertexPosition = grassMat * vec3(pos.x, pos.y, 0.0);

          // Transform the position to screen space
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(grassVertexPosition, 1.0);
      }
    `;
  }

  // Fragment shader for grass color
  grassFragmentShader() {
    return `
      varying vec3 vPosition; // Varying variable to pass the position to the fragment shader
      void main() {
        vec3 baseColor = vec3(0.0, 0.5, 0.0); // Base color for the grass
        vec3 tipColor = vec3(0.5, 0.5, 0.1);  // Tip color for the grass

        // Use the v-coordinate of the UV to determine the gradient
        float gradientFactor = vPosition.y; // Assuming vPosition.y is normalized (0 at base, 1 at tip)

        // Interpolate between baseColor and tipColor
        vec3 diffuseColor = mix(baseColor, tipColor, clamp(gradientFactor, 0.0, 1.0));

        vec3 ambientLightColor = vec3(0.2, 0.2, 0.2); // Soft white ambient light
        float ambientIntensity = 1.0; // Intensity of ambient light

        // Calculate ambient light contribution
        vec3 ambient = ambientLightColor * ambientIntensity;

        // Light direction (example: light coming from the top-right)
        vec3 lightDirection = normalize(vec3(10.0, 10.0, 10.0));

        // Surface normal (assuming it's passed from the vertex shader)
        vec3 normal = normalize(vec3(0.5, 1, 0));

        // Diffuse reflection calculation
        float diffuseIntensity = max(dot(normal, lightDirection), 0.2);
        vec3 diffuseReflection = diffuseColor * diffuseIntensity;

        // Combine ambient and diffuse reflection
        vec3 finalColor = ambient + diffuseReflection;

        // Set the final color
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
  }

  // Update the grass field
  update(time) {
    this.grassMesh.material.uniforms.time.value = time; // Update time for wind animation
    this.outlineMesh.material.uniforms.time.value = time; // Update time for outline mesh

    // Update wind direction over time
    const angle = Math.sin(time) * Math.PI * 0.25; // Oscillate wind direction
    this.windDirection.set(Math.cos(angle), Math.sin(angle));
    this.grassMesh.material.uniforms.windDirection.value.copy(this.windDirection);
    this.outlineMesh.material.uniforms.windDirection.value.copy(this.windDirection);

    /**
     * TODO:
     * 1. animate wind strength
     * wind strength should be same for particular period of time and then change
     * need to find a function to animate wind strength
     */
  }

  updateWindStrength(windStrength) {
    this.windStrength = windStrength;
    this.grassMesh.material.uniforms.windStrength.value = windStrength;
    this.outlineMesh.material.uniforms.windStrength.value = windStrength;
  }

  startAnimation() {
    this.interval = setInterval(() => {
      const now = Date.now();
      this.update(Math.sin(now * 2.0) * 0.5 + 0.5);
    }, 100);
  }

  stopAnimation() {
    clearInterval(this.interval);
  }
}