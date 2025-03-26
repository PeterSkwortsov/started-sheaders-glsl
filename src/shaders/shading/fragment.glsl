uniform vec3 uColor;
uniform vec3 uResolution;
uniform float unShadowRepetitions;
uniform vec3 uShadowColor;
uniform float uLightRepetitions;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

vec3 halftone(
  vec3 color,
  float repeations,
  vec3 direction,
  float low,
  float hight,
  vec3 pointColor,
  vec3 normal
)
{
  float intensity = dot(normal, direction);
  intensity = smoothstep(low, hight, intensity);
  vec2 uv = gl_FragCoord.xy / uResolution.y ;
    uv *= repeations;
  uv = mod(uv, 0.4);

      float point = distance(uv, vec2(0.2));
      point = 1.0 - step(0.2 * intensity, point);

      return mix(color, pointColor, point);

}

void main()
{
    vec3 normal = normalize(vNormal);

    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 color = uColor;
    vec3 light = vec3(0.0);

     light += ambientLight(
    vec3(1.0),
    1.0
  );

  light += directionalLight(
    vec3(1.0),
    1.0,
    normal,
    vec3(1.0, 1.0, 0.0),
    viewDirection,
    1.0
  );

    color *= light;

    float repeations = 40.0;

  vec3 direction = vec3(0.0, -1.0, 0.0); // направлкение вниз
  float low = -0.9;
  float hight = 1.3;
  vec3 pointColor = vec3(1.0, 0.0, 0.0);

  color = halftone(
    color,
    unShadowRepetitions,
    vec3(0.0, -1.0, 0.0),
    -0.8,
    1.5,
    uShadowColor,
    normal
  );
  color = halftone(
    color,
    uLightRepetitions,
    vec3(1.0, 0.0, 0.0),
    -0.3,
    1.5,
    uLightColor,
    normal
  );


    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}