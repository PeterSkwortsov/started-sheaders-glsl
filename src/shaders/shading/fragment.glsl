uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl



void main()
{
    vec3 normal = normalize(vNormal);

    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 color = uColor;

    //Light
    vec3 light = vec3(0.0);

    light += ambientLight(
    vec3(0.9), // Light color
    0.2      // Light intensity
    );
    light += directionalLight(
    vec3(0, 0,0),  // Light color
    0.4,                  // Light intensity
    normal,               //Normal
    vec3(0, 12, 0),  // Light position
    viewDirection,         //View Direction
    10.0                  // Specular Power
    );
     light += pointLight(
    vec3(0, 3.1, 2.0),  //Light color
    20.0,                  //Light intensity
    normal,               //Normal
    vec3(3, 1, 0.4),  //Light position
    viewDirection,        //View Direction
 30.0,                 //Specular Power
    vPosition,            //position
    0.55            //light Decay           
    );
     light += pointLight(
    vec3(5.0, 3.1, 1.0),  //Light color
    0.2,                  //Light intensity
    normal,               //Normal
    vec3(0, 1,-1),  //Light position
    viewDirection,        //View Direction
    20.0,                 //Specular Power
    vPosition,            //position
    0.18           //light Decay           
    );
     color *= light;


    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}