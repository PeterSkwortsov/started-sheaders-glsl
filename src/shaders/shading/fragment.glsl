 precision mediump float;

varying vec2 vUv;
varying float vElevation;
varying vec3 vPosition;


uniform vec3 udDephColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying vec3 vNormal;

#include ../includes/pointLight.glsl

void main()
{
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);




  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(udDephColor, uSurfaceColor, mixStrength);
    mixStrength = smoothstep(0.0, 1.0, mixStrength);

    vec3 light = vec3(0.0);

  light += pointLight(
    vec3(1.0),
    10.0,
    normal,
    vec3(0.8824, 0.9176, 0.8039),
    viewDirection,
    30.0,
    vPosition,
    0.95
  ); 
  // light += directionalLight(
  //   vec3(1.0),
  //   1.0,
  //   normal,
  //   vec3(-1.0, 0.5, 0.0),
  //   viewDirection,
  //   30.0
  // ); 

  color *= light;

    gl_FragColor = vec4(color, 1.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}