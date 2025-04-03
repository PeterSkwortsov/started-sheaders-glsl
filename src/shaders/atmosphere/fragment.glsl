
varying vec3 vNormal;
varying vec3 vPosition;


void main()
{
 
 vec2 uv = gl_PointCoord;
 gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}