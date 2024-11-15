#import bevy_sprite::mesh2d_vertex_output::VertexOutput
#import bevy_render::globals::Globals

//  MIT License. © Ian McEwan, Stefan Gustavson, Munrocket
//
fn permute4(x: vec4<f32>) -> vec4<f32> { return ((x * 34. + 1.) * x) % vec4<f32>(289.); }
fn taylorInvSqrt4(r: vec4<f32>) -> vec4<f32> { return 1.79284291400159 - 0.85373472095314 * r; }

fn simplexNoise3(v: vec3<f32>) -> f32 {
  let C = vec2<f32>(1. / 6., 1. / 3.);
  let D = vec4<f32>(0., 0.5, 1., 2.);

  // First corner
  var i: vec3<f32>  = floor(v + dot(v, C.yyy));
  let x0 = v - i + dot(i, C.xxx);

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  // x0 = x0 - 0. + 0. * C
  let x1 = x0 - i1 + 1. * C.xxx;
  let x2 = x0 - i2 + 2. * C.xxx;
  let x3 = x0 - 1. + 3. * C.xxx;

  // Permutations
  i = i % vec3<f32>(289.);
  let p = permute4(permute4(permute4(
      i.z + vec4<f32>(0., i1.z, i2.z, 1. )) +
      i.y + vec4<f32>(0., i1.y, i2.y, 1. )) +
      i.x + vec4<f32>(0., i1.x, i2.x, 1. ));

  // Gradients (NxN points uniformly over a square, mapped onto an octahedron.)
  var n_: f32 = 1. / 7.; // N=7
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49. * floor(p * ns.z * ns.z); // mod(p, N*N)

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_); // mod(j, N)

  let x = x_ *ns.x + ns.yyyy;
  let y = y_ *ns.x + ns.yyyy;
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4<f32>( x.xy, y.xy );
  let b1 = vec4<f32>( x.zw, y.zw );

  let s0 = floor(b0)*2.0 + 1.0;
  let s1 = floor(b1)*2.0 + 1.0;
  let sh = -step(h, vec4<f32>(0.));

  let a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  let a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  var p0: vec3<f32> = vec3<f32>(a0.xy, h.x);
  var p1: vec3<f32> = vec3<f32>(a0.zw, h.y);
  var p2: vec3<f32> = vec3<f32>(a1.xy, h.z);
  var p3: vec3<f32> = vec3<f32>(a1.zw, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt4(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 = p0 * norm.x;
  p1 = p1 * norm.y;
  p2 = p2 * norm.z;
  p3 = p3 * norm.w;

  // Mix final noise value
  var m: vec4<f32> = 0.6 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3));
  m = max(m, vec4<f32>(0.));
  m = m * m;
  return 42. * dot(m * m, vec4<f32>(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

fn hashOld33(p: vec3<f32>) -> vec3<f32> {
    let q = vec3<f32>(
        dot(p, vec3<f32>(127.1, 311.7, 74.7)),
        dot(p, vec3<f32>(269.5, 183.3, 246.1)),
        dot(p, vec3<f32>(113.5, 271.9, 124.6))
    );

    return fract(sin(q) * 43758.5453123);
}

fn hash13(p3: vec3<f32>) -> f32
{
	  var q  = fract(p3 * .1031);
    q += dot(q, q.zyx + 31.32);
    return fract((q.x + q.y) * q.z);
}

fn nois(p3: vec3<f32>) -> f32
{
  let q3 = floor(p3);
  return fract(sin(dot(q3, vec3f(12.9898, 78.233, 69.420))) * 43758.5453);
}

fn smooth_circle_boundary(color: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {
    return mix(color, vec4<f32>(color.rgb, 0.0), smoothstep(0.48, 0.5, length(uv - vec2<f32>(0.5, 0.5))));
}

@group(2) @binding(0) var<uniform> material_color: vec4<f32>;
@group(2) @binding(1) var<uniform> noise_level: vec4<f32>;

@group(0) @binding(1) var<uniform> globals: Globals;

const PI = 3.14159265359;

fn petal(uv_inp: vec2<f32>) -> f32 {
    var uv = uv_inp;

    // uv *= 0.8;
    // uv.y -= 0.26;
    // uv.y += 0.5;
    uv.y -= 0.5;
    // uv.x /= uv.y*uv.y*1.0;
    uv.x *= uv.y;
    uv.y += 0.5;
    // let y = uv.y - 0.5;
    // let r = sqrt(x * x + y * y);
    // let theta = atan2(y, x);
    // let angle = modf(theta + 2.0 * PI, 2.0 * PI).fract;
    // let petal = 1.0 - abs(1.0 - modf(angle, PI).fract / PI);
    // return petal;
    // return smoothstep(0.0, 0.01, uv.y)/2.0+smoothstep(0.0,0.01, uv.x)/2.0;
    let c = 0.5;
    return smoothstep(c-0.01, c, length(uv));
}

@fragment
fn fragment(mesh: VertexOutput) -> @location(0) vec4<f32> {
    let uv = mesh.uv * 2.0 - 1.0;
    let theta = atan2(uv.y, uv.x) + 2*PI;
    let r = length(uv);

    let k = 4.0;
    let angle = (f32(k)*theta/(2*PI) - trunc(f32(k)*theta/(2*PI)))*2*PI;

    let uv_rot = vec2<f32>(r*cos(angle), r*sin(angle));

    let f = 1.0-petal(uv_rot);

    return vec4<f32>(material_color.rgb, f);
}


// no high res circle needed for this
