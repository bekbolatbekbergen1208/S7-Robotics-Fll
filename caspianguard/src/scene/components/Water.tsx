"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS, EXPLODE_LIFT, WATERLINE } from "../config";
import { shipPose, timeline } from "../state";

const vertex = /* glsl */ `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uShip;      // x, z, поворот по Y
  uniform float uWake;
  uniform float uSpeed;
  uniform float uLift;
  uniform float uEndGlow;
  uniform vec3 uDeep;
  uniform vec3 uSky;
  uniform vec3 uGlow;
  varying vec3 vWorld;
  #include <fog_pars_fragment>

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float height(vec2 p) {
    float t = uTime;
    float h = noise(p * 0.9 + vec2(t * 0.12, t * 0.05)) * 0.6;
    h += noise(p * 2.3 - vec2(t * 0.2, -t * 0.11)) * 0.28;
    #ifndef LITE
    h += noise(p * 5.1 + vec2(-t * 0.31, t * 0.27)) * 0.12;
    #endif
    return h;
  }

  void main() {
    vec2 p = vWorld.xz;
    float e = 0.05;
    float h0 = height(p);
    float hx = height(p + vec2(e, 0.0));
    float hz = height(p + vec2(0.0, e));
    vec3 n = normalize(vec3(-(hx - h0) / e * 0.22, 1.0, -(hz - h0) / e * 0.22));

    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 4.0);
    vec3 col = mix(uDeep, uSky, 0.06 + fres * 0.85);

    // Блик от холодного «лунного» света.
    vec3 L = normalize(vec3(0.35, 0.55, 0.75));
    float spec = pow(max(dot(n, normalize(L + viewDir)), 0.0), 160.0);
    col += vec3(0.55, 0.8, 0.9) * spec * 0.45;

    // Координаты в системе корабля: lx вдоль носа (+X), lz поперёк.
    vec2 d = p - uShip.xy;
    float cr = cos(uShip.z), sr = sin(uShip.z);
    float lx = d.x * cr - d.y * sr;
    float lz = d.x * sr + d.y * cr;
    float surface = 1.0 - uLift;

    // Светящийся след за кормой.
    float behind = -lx - 1.1;
    float wake = 0.0;
    if (behind > 0.0) {
      float w = 0.22 + behind * 0.16;
      float flow = noise(vec2(behind * 3.0 - uTime * (1.0 + uSpeed * 3.0), lz * 5.0));
      float core = exp(-lz * lz / (w * w)) * exp(-behind / (2.0 + uSpeed * 3.0));
      float props = exp(-pow(abs(lz) - 0.42, 2.0) / (0.006 + behind * 0.01)) * exp(-behind / 1.6);
      wake = (core * (0.35 + flow * 0.9) + props * 0.8) * uWake;
    }
    // Свечение вдоль ватерлинии вокруг корпуса.
    vec2 q = vec2(lx / 1.24, lz / 0.63);
    float ring = exp(-pow((length(q) - 1.0) * 7.0, 2.0)) * (0.4 + 0.6 * noise(p * 8.0 + uTime));
    float glow = wake + ring * 0.45 * surface;

    // Редкие биолюминесцентные искры.
    #ifndef LITE
    vec2 cell = floor(p * 7.0);
    float rnd = hash(cell);
    vec2 inCell = fract(p * 7.0) - 0.5;
    float twinkle = step(0.965, rnd) * pow(0.5 + 0.5 * sin(uTime * 1.7 + rnd * 60.0), 8.0);
    glow += twinkle * exp(-dot(inCell, inCell) * 40.0) * (0.5 + wake * 3.0);
    #endif

    col += uGlow * glow * 1.3;

    // Дорожка от света на горизонте в финале.
    float lane = exp(-pow(vWorld.z * 0.45, 2.0)) * smoothstep(-2.0, 30.0, vWorld.x) * uEndGlow;
    col += vec3(0.45, 0.85, 0.95) * lane * (0.25 + noise(p * vec2(0.6, 3.0) + uTime * 0.3) * 0.35);

    // Вода полупрозрачная у корабля: подводные винты и датчики просвечивают.
    float dist = length(d);
    float alpha = mix(0.62, 0.95, smoothstep(0.8, 3.0, dist));

    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function Water({ lite }: { lite: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        defines: lite ? { LITE: "" } : {},
        transparent: true,
        depthWrite: false,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uShip: { value: new THREE.Vector3() },
            uWake: { value: 1 },
            uSpeed: { value: 0.3 },
            uLift: { value: 0 },
            uEndGlow: { value: 0 },
            uDeep: { value: new THREE.Color(COLORS.deepWater) },
            uSky: { value: new THREE.Color(COLORS.sky) },
            uGlow: { value: new THREE.Color(COLORS.glow) },
          },
        ]),
      }),
    [lite],
  );

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const root = shipPose.root;
    if (root) u.uShip.value.set(root.position.x, root.position.z, root.rotation.y);
    const lift = root ? THREE.MathUtils.clamp((root.position.y + WATERLINE) / EXPLODE_LIFT, 0, 1) : 0;
    u.uLift.value = lift;
    u.uWake.value = timeline.wake * (1 - lift);
    u.uSpeed.value = timeline.speed;
    u.uEndGlow.value = timeline.glow;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={2} material={material}>
      <planeGeometry args={[140, 140]} />
    </mesh>
  );
}
