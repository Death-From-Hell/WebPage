// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                  WebPageMath
// ----------------------------------------------

function Mat4() {}
Mat4.copy = function(a) {
	return new Float32Array(a);
}
Mat4.null = function() {
	return new Float32Array(
		[0,0,0,0,
		 0,0,0,0,
		 0,0,0,0,
		 0,0,0,0]
	);
}
Mat4.identity = function() {
	return new Float32Array(
		[1,0,0,0,
		 0,1,0,0,
		 0,0,1,0,
		 0,0,0,1]
	);
}
Mat4.transpose = function(a) {
	return new Float32Array(
		[a[0], a[4], a[8], a[12],
		 a[1], a[5], a[9], a[13],
		 a[2], a[6], a[10], a[14],
		 a[3], a[7], a[11], a[15]]
	);
}
Mat4.multiplyByMatrix = function(a, b) {
	// a, b - матрицы 4x4
	const out = new Float32Array(16);
	out[0] = a[0]*b[0] + a[1]*b[4] + a[2]*b[8] + a[3]*b[12];
	out[1] = a[0]*b[1] + a[1]*b[5] + a[2]*b[9] + a[3]*b[13];
	out[2] = a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14];
	out[3] = a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15];
	out[4] = a[4]*b[0] + a[5]*b[4] + a[6]*b[8] + a[7]*b[12];
	out[5] = a[4]*b[1] + a[5]*b[5] + a[6]*b[9] + a[7]*b[13];
	out[6] = a[4]*b[2] + a[5]*b[6] + a[6]*b[10] + a[7]*b[14];
	out[7] = a[4]*b[3] + a[5]*b[7] + a[6]*b[11] + a[7]*b[15];
	out[8] = a[8]*b[0] + a[9]*b[4] + a[10]*b[8] + a[11]*b[12];
	out[9] = a[8]*b[1] + a[9]*b[5] + a[10]*b[9] + a[11]*b[13];
	out[10] = a[8]*b[2] + a[9]*b[6] + a[10]*b[10] + a[11]*b[14];
	out[11] = a[8]*b[3] + a[9]*b[7] + a[10]*b[11] + a[11]*b[15];
	out[12] = a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12];
	out[13] = a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13];
	out[14] = a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14];
	out[15] = a[12]*b[3] + a[13]*b[7] + a[14]*b[11] + a[15]*b[15];
	return out;
}
Mat4.multiplyByVector = function(a, b) {
	// a - матрица 4x4
    // b - вектор
	const out = new Float32Array(4);
	out[0] = a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];
	out[1] = a[4]*b[0] + a[5]*b[1] + a[6]*b[2] + a[7]*b[3];
	out[2] = a[8]*b[0] + a[9]*b[1] + a[10]*b[2] + a[11]*b[3];
	out[3] = a[12]*b[0] + a[13]*b[1] + a[14]*b[2] + a[15]*b[3];
	return out;
}
Mat4.translate = function(x, y, z) {
	return new Float32Array([
		1, 0, 0, x,
		0, 1, 0, y,
		0, 0, 1, z,
		0, 0, 0, 1
	]);
}
Mat4.rotateX = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		1, 0, 0, 0,
		0, cos, -sin, 0,
		0, sin, cos, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateY = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		cos, 0, sin, 0,
		0, 1, 0, 0,
		-sin, 0, cos, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateZ = function(a) {
	const cos = Math.cos(a);
	const sin = Math.sin(a);
	return new Float32Array([
		cos, -sin, 0, 0,
		sin, cos, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}
Mat4.rotateXYZ = function(x, y, z) {
	const cosX = Math.cos(x);
	const sinX = Math.sin(x);
	const cosY = Math.cos(y);
	const sinY = Math.sin(y);
	const cosZ = Math.cos(z);
	const sinZ = Math.sin(z);
	const out = new Float32Array(16);
	out[0] = cosY * cosZ;
	out[1] = sinX * sinY * cosZ  - cosX * sinZ;
	out[2] = cosX * sinY * cosZ  + sinX * sinZ;
	out[3] = 0;
	out[4] = cosY * sinZ;
	out[5] = sinX * sinY * sinZ + cosX * cosZ;
	out[6] = cosX * sinY * sinZ - sinX * cosZ;
	out[7] = 0;
	out[8] = -sinY;
	out[9] = sinX * cosY;
	out[10] = cosX * cosY;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}
Mat4.scale = function(x, y, z) {
	return new Float32Array([
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1
	]);
}
Mat4.normalize = function(v) {
	const out = new Float32Array(4);
	const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	out[0] = v[0] / len;
	out[1] = v[1] / len;
	out[2] = v[2] / len;
	out[3] = v[3];
	return out;
}
Mat4.normal = function(v1, v2, v3) {
	const u = new Float32Array(3), v = new Float32Array(3), n = new Float32Array(4);
	u[0] = v2[0] - v1[0];
	u[1] = v2[1] - v1[1];
	u[2] = v2[2] - v1[2];
	v[0] = v3[0] - v1[0];
	v[1] = v3[1] - v1[1];
	v[2] = v3[2] - v1[2];
	n[0] = u[1]*v[2] - u[2]*v[1];
	n[1] = u[2]*v[0] - u[0]*v[2];
	n[2] = u[0]*v[1] - u[1]*v[0];
	n[3] = v1[3];
	return Mat4.normalize(n);
}
Mat4.projection = function() {
	return new Float32Array(
		[2, 0, 0,-1,
		 0,-2, 0, 1,
		 0, 0, 1, 0,
		 0, 0, 0, 1]
	);
}
Mat4.simplePerspective = function(_params) {
	const aspect = _params.screenWidth / _params.screenHeight;
	const f = 1 / Math.tan((Math.PI / 180 * _params.angle) / 2);
	const c1 = 2 * _params.far * _params.near / (_params.near - _params.far);
	const c2 = (_params.near + _params.far) / (_params.near - _params.far);
	const out = Mat4.null();
	out[0] = f / aspect;
	out[5] = f;
	out[10] = c2;
	out[11] = c1;
	out[14] = -1;
	return out;
}
Mat4.lookAt = function(_params) {
	let z = Vec3.subtract(_params.camera, _params.object);
	z = Vec3.normalize(z);
	let x = Vec3.cross(_params.up, z);
	x = Vec3.normalize(x);
	let y = Vec3.cross(z, x);
	y = Vec3.normalize(y);
	const tx = -Vec3.dot(x, _params.camera);
	const ty = -Vec3.dot(y, _params.camera);
	const tz = -Vec3.dot(z, _params.camera);
	const out = Mat4.null();
	out[0] = x[0];
	out[1] = x[1];
	out[2] = x[2];
	out[3] = tx;
	out[4] = y[0];
	out[5] = y[1];
	out[6] = y[2];
	out[7] = ty;
	out[8] = z[0];
	out[9] = z[1];
	out[10] = z[2];
	out[11] = tz;
// 	out[12] = 0;
// 	out[13] = 0;
// 	out[14] = 0;
	out[15] = 1;
	return out;
}
Mat4.lookAtOnlyRotation = function(_params) {
	let z = Vec3.subtract(_params.camera, _params.object);
	z = Vec3.normalize(z);
	let x = Vec3.cross(_params.up, z);
	x = Vec3.normalize(x);
	let y = Vec3.cross(z, x);
	y = Vec3.normalize(y);
	const out = Mat4.null();
	out[0] = x[0];
	out[1] = x[1];
	out[2] = x[2];
	out[4] = y[0];
	out[5] = y[1];
	out[6] = y[2];
	out[8] = z[0];
	out[9] = z[1];
	out[10] = z[2];
	out[15] = 1;
	return out;
}

// ================== //
//       Vec3         //
// ================== //
class Vec3 {
    constructor() {
    }
    static create() {
        return new Float32Array([0, 0, 0]);
    }
    static createFromValues(x, y, z) {
        const out = Vec3.create();
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
    static createFromArray(array) {
        const out = Vec3.create();
        out[0] = array[0];
        out[1] = array[1];
        out[2] = array[2];
        return out;
    }
    static copy(a) {
        const out = Vec3.create();
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    static length(a) {
        return Math.hypot(a[0], a[1], a[2]);
    }
    static add(a, b) {
        const out = Vec3.create();
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    }
    static subtract(a, b) {
        const out = Vec3.create();
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    }
    static multiply(a, b) {
        const out = Vec3.create();
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    }
    static divide(a, b) {
        const out = Vec3.create();
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    }
    static ceil(a) {
        const out = Vec3.create();
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        return out;
    }
    static floor(a) {
        const out = Vec3.create();
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        return out;
    }
    static min(a, b) {
        const out = Vec3.create();
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    }
    static max(a, b) {
        const out = Vec3.create();
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    }
    static round(a) {
        const out = Vec3.create();
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        return out;
    }
    static scale(a, b) {
        const out = Vec3.create();
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        return out;
    }
    static distance(a, b) {
        const x = b[0] - a[0];
        const y = b[1] - a[1];
        const z = b[2] - a[2];
        return Math.hypot(x, y, z);
    }
    static negate(a) {
        const out = Vec3.create();
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    }
    static inverse(a) {
        const out = Vec3.create();
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    }
    static normalize(a) {
        const out = Vec3.create();
        let len = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        return out;
    }
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    static cross(a, b) {
        const out = Vec3.create();
        out[0] = a[1] * b[2] - a[2] * b[1];
        out[1] = a[2] * b[0] - a[0] * b[2];
        out[2] = a[0] * b[1] - a[1] * b[0];
        return out;
	}
    static crossL(a, b) {
        const out = Vec3.create();
        out[0] = a[2] * b[1] - a[1] * b[2];
        out[1] = a[0] * b[2] - a[2] * b[0];
        out[2] = a[1] * b[0] - a[0] * b[1];
        return out;
	}
}

function Quat() {}
Quat.null = function() {
	return new Float32Array([0,0,0,0]);
}
Quat.identity = function() {
	// Возвращает единичный кватернион
	return new Float32Array([1,0,0,0]);
}
Quat.setAxisAngle = function(axis, angle) {
	// Создает кватернион из заданной оси axis и угла angle
	const out = Quat.null();
	angle = angle * 0.5;
	let s = Math.sin(angle);
	out[0] = Math.cos(angle);
	out[1] = s * axis[0];
	out[2] = s * axis[1];
	out[3] = s * axis[2];
	return out;
}
Quat.multiply = function(q, r) {
	// Перемножает два кватерниона
	const out = Quat.null();
	out[0] = r[0]*q[0] - r[1]*q[1] - r[2]*q[2] - r[3]*q[3];
	out[1] = r[0]*q[1] + r[1]*q[0] - r[2]*q[3] + r[3]*q[2];
	out[2] = r[0]*q[2] + r[1]*q[3] + r[2]*q[0] - r[3]*q[1];
	out[3] = r[0]*q[3] - r[1]*q[2] + r[2]*q[1] + r[3]*q[0];
	return out;
}
Quat.fromVector = function(vector) {
	// Создает кватернион из трехмерного вектора
	return new Float32Array([0, vector[0], vector[1], vector[2]]);
}
Quat.conjugate = function(quat) {
	return new Float32Array([quat[0], -quat[1], -quat[2], -quat[3]]);
}
Quat.rotate = function(vector, quat) {
	// Возвращает новые координаты вектора vector
	// quat - кватернион поворота
	const vQuat = Quat.fromVector(vector);
	const cQuat = Quat.conjugate(quat);
	const m1 = Quat.multiply(quat, vQuat);
	const m2 = Quat.multiply(m1, cQuat);
	return new Float32Array([m2[1], m2[2], m2[3]]);
}



export {Mat4, Vec3, Quat};
