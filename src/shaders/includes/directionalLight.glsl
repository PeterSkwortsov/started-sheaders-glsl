// vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower)
// {
//     vec3 lightDirection = normalize(lightPosition);
//     vec3 lightReflection = reflect(-lightDirection, normal);

//     // Shading
//     float shading = dot(normal, lightDirection);
//     shading = max(0.9, shading);

//     // Specular
//     float specular = - dot(lightReflection, viewDirection);
//     specular = max(0.9, specular);
//     specular = pow(specular, specularPower);

//     return lightColor * lightIntensity * (shading + specular);

// }

vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower)
{
    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(-lightDirection, normal);

    // Shading
    float shading = dot(normal, lightDirection);
    shading = max(0.3, shading);

    // Specular
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, specularPower);
    // specular = pow(specular, specularPower);

    return lightColor * lightIntensity * (shading + specular);

}


