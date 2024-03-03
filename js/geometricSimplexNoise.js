// Geometric Simplex Noise
// Based on the work of Stefan Gustavson

float geometricSimplexNoise(vec2 p) {
vec2 f = fract(p);
vec2 i = floor(p);
f = f * f * f;
f = f * (f - 3.0);
i = mod(i, 256.0);
float a = i.x + i.y * 256.0;
float b = a + 1.0;
float v1 = dot(f, vec2(a, b));
float v2 = dot(f, vec2(b, a));
return 0.5 * (v1 + v2);
}

float geometricSimplexNoise(vec3 p) {
vec3 f = fract(p);
vec3 i = floor(p);
f = f * f * f;
f = f * (f - 3.0);
i = mod(i, 256.0);
float a = i.x + i.y * 256.0 + i.z * 256.0 * 256.0;
float b = a + 1.0;
float v1 = dot(f, vec3(a, b, a));
float v2 = dot(f, vec3(b, a, b));
float v3 = dot(f, vec3(a, b, b));
float v4 = dot(f, vec3(b, a, a));
return 0.5 * (v1 + v2 + v3 + v4);
}
