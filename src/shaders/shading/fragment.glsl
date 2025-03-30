uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;

uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;


void main()
{
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.08, 0.01, 0.08);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

float sunOrientation = dot(uSunDirection, normal);


  float dayMix = smoothstep(-0.25, 0.5,sunOrientation);
  vec3 dayColor = texture(uDayTexture, vUv).rgb;
  vec3 nightColor = texture(uNightTexture, vUv).rgb;
  vec3 specularCloudsTexture = texture(uSpecularCloudsTexture, vUv).rgb;

 color = mix(nightColor, dayColor, dayMix);

vec2 specularCloudsColor = texture
(uSpecularCloudsTexture, vUv).rg;

// облака
float cloudsMix = smoothstep(0.2, 1.0, specularCloudsColor.g);
cloudsMix *= dayMix;
color = mix(color, vec3(1.0), cloudsMix);

// Линза Фринеля
float fresnel = dot(viewDirection, normal) + 1.0;
fresnel = pow(fresnel, 5.0);

// атмосфера
float atmosfereDayMix = smoothstep(-0.5, 1.0,sunOrientation);
vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosfereDayMix);
color = mix(color, atmosphereColor, fresnel * atmosfereDayMix);

vec3 reflection = reflect(- uSunDirection, normal);
float specular = -dot(reflection, viewDirection);
specular = max(specular, 0.0);
specular = pow(specular, 32.0);
specular *= specularCloudsTexture.r;

vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}