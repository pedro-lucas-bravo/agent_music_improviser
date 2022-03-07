function CartesianToSpherical(coord) {
    var dist = Math.sqrt(coord.x * coord.x + coord.y * coord.y + coord.z * coord.z);
    var theta = Math.atan2(coord.y, coord.x);
    var phi = Math.PI * 0.5 - Math.acos(coord.z/dist);
    //ele = 90 - np.rad2deg(phi)
    //azi = np.rad2deg(theta)
    return [theta, phi, dist];//az, ele, dist
}

function SphericalToCartesian(theta, phi, dist){
    //phi = np.deg2rad(90-ele)
    //theta = np.deg2rad(azi)
    
    phi = Math.PI * 0.5 - phi;

    var x = dist * Math.sin(phi) * Math.cos(theta)
    //x=ρsinφcosθ 
    var y = dist * Math.sin(phi) * Math.sin(theta)
    //y=ρsinφsinθ 
    var z = dist * Math.cos(phi)
    //z=ρcosφ
    return [x, y, z];
}