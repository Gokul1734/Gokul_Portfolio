import { useEffect, useRef } from "react";

const AmbientScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let cleanupScene = () => {};

    import("three")
      .then((THREE) => {
        if (disposed || !canvasRef.current) return;

        let renderer;

        try {
          renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch (error) {
          console.error("The Three.js background could not initialize WebGL.", error);
          return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          54,
          window.innerWidth / window.innerHeight,
          0.1,
          80
        );
        camera.position.z = 22;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);

        const sculpture = new THREE.Group();
        sculpture.position.set(2.4, 0.25, -2);
        scene.add(sculpture);

        const lime = new THREE.Color("#c3f56a");
        const rings = [
          { radius: 6.2, rotation: [0.85, 0.15, 0.18], opacity: 0.12 },
          { radius: 4.7, rotation: [1.32, 0.48, -0.5], opacity: 0.1 },
          { radius: 3.2, rotation: [0.2, 1.05, 0.35], opacity: 0.08 },
        ].map(({ radius, rotation, opacity }) => {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.012, 6, 180),
            new THREE.MeshBasicMaterial({
              color: lime,
              transparent: true,
              opacity,
              depthWrite: false,
            })
          );
          ring.rotation.set(...rotation);
          sculpture.add(ring);
          return ring;
        });

        const crystalGeometry = new THREE.EdgesGeometry(
          new THREE.IcosahedronGeometry(1.7, 1)
        );
        const crystal = new THREE.LineSegments(
          crystalGeometry,
          new THREE.LineBasicMaterial({
            color: lime,
            transparent: true,
            opacity: 0.1,
            depthWrite: false,
          })
        );
        sculpture.add(crystal);

        const count = 280;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const viewHeight =
          2 *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          camera.position.z;
        const viewWidth = viewHeight * camera.aspect;
        const pale = new THREE.Color("#c8d3bd");

        for (let index = 0; index < count; index += 1) {
          const offset = index * 3;
          positions[offset] = (Math.random() - 0.5) * viewWidth * 1.8;
          positions[offset + 1] = (Math.random() - 0.5) * viewHeight * 1.8;
          positions[offset + 2] = (Math.random() - 0.5) * 13 - 5;
          phases[index] = Math.random() * Math.PI * 2;

          const tint = Math.random() > 0.78 ? lime : pale;
          colors[offset] = tint.r;
          colors[offset + 1] = tint.g;
          colors[offset + 2] = tint.b;
        }

        const basePositions = positions.slice();
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        particleGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(colors, 3)
        );

        const particles = new THREE.Points(
          particleGeometry,
          new THREE.PointsMaterial({
            size: 0.055,
            vertexColors: true,
            transparent: true,
            opacity: 0.68,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        scene.add(particles);

        const connections = [];
        for (let first = 0; first < count; first += 1) {
          for (let second = first + 1; second < count; second += 1) {
            const firstOffset = first * 3;
            const secondOffset = second * 3;
            const dx = basePositions[firstOffset] - basePositions[secondOffset];
            const dy =
              basePositions[firstOffset + 1] - basePositions[secondOffset + 1];
            const dz =
              basePositions[firstOffset + 2] - basePositions[secondOffset + 2];

            if (dx * dx + dy * dy + dz * dz < 4.4) {
              connections.push(
                basePositions[firstOffset],
                basePositions[firstOffset + 1],
                basePositions[firstOffset + 2],
                basePositions[secondOffset],
                basePositions[secondOffset + 1],
                basePositions[secondOffset + 2]
              );
            }
          }
        }

        const networkGeometry = new THREE.BufferGeometry();
        networkGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(connections, 3)
        );
        const networkMaterial = new THREE.LineBasicMaterial({
          color: lime,
          transparent: true,
          opacity: 0.07,
          depthWrite: false,
        });
        const network = new THREE.LineSegments(networkGeometry, networkMaterial);
        scene.add(network);

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        let frameId;
        let targetX = 0;
        let targetY = 0;

        const render = (time = 0) => {
          if (!reducedMotion) {
            for (let index = 0; index < count; index += 1) {
              const offset = index * 3;
              const phase = phases[index] + time * 0.00016;
              positions[offset] =
                basePositions[offset] + Math.sin(phase) * 0.1;
              positions[offset + 1] =
                basePositions[offset + 1] + Math.cos(phase * 0.8) * 0.14;
            }

            particleGeometry.attributes.position.needsUpdate = true;
            sculpture.rotation.x += (targetY - sculpture.rotation.x) * 0.012;
            sculpture.rotation.y += (targetX - sculpture.rotation.y) * 0.012;
            sculpture.rotation.z = time * 0.000025;
            rings.forEach((ring, index) => {
              ring.rotation.z += (index + 1) * 0.00006;
            });
            networkMaterial.opacity = 0.055 + (Math.sin(time * 0.00035) + 1) * 0.012;
          }

          renderer.render(scene, camera);
        };

        const animate = (time) => {
          render(time);
          frameId = window.requestAnimationFrame(animate);
        };

        const resize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          render(performance.now());
        };

        const movePointer = (event) => {
          targetX = (event.clientX / window.innerWidth - 0.5) * 0.18;
          targetY = (event.clientY / window.innerHeight - 0.5) * 0.12;
        };

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", movePointer, { passive: true });
        resize();

        if (!reducedMotion) {
          frameId = window.requestAnimationFrame(animate);
        }

        cleanupScene = () => {
          window.cancelAnimationFrame(frameId);
          window.removeEventListener("resize", resize);
          window.removeEventListener("pointermove", movePointer);
          scene.traverse((object) => {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material?.dispose();
            }
          });
          renderer.dispose();
        };
      })
      .catch((error) => {
        if (!disposed) {
          console.error("The Three.js background failed to load.", error);
        }
      });

    return () => {
      disposed = true;
      cleanupScene();
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-scene" aria-hidden="true" />;
};

export default AmbientScene;
