function CartesianToSpherical(coord) {
    var dist = Math.sqrt(coord.x * coord.x + coord.y * coord.y + coord.z * coord.z);
    var theta = Math.atan2(coord.y, coord.x);
    var phi = Math.PI * 0.5 - Math.acos(coord.z/dist);
    //ele = 90 - np.rad2deg(phi)
    //azi = np.rad2deg(theta)
    return [theta, phi, dist];//az, ele, dist
}