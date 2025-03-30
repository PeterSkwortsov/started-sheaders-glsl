
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec3 vNormal;
varying vec3 vPosition;


void main()
{
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.08, 0.01, 0.08);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

float sunOrientation = dot(uSunDirection, normal);


// атмосфера
float atmosfereDayMix = smoothstep(-0.5, 1.0,sunOrientation);
vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosfereDayMix);
color += atmosphereColor; 

float edgeAlpha = dot(viewDirection, normal);
edgeAlpha = smoothstep(0.0, 0.7, edgeAlpha);

float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);
float alpha = edgeAlpha * dayAlpha;


    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}