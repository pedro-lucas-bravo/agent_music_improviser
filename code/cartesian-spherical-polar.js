function CartesianToSpherical(x, y, z) {
    var dist = Math.sqrt(x * x + y * y + z * z);
    var theta = Math.atan2(y, x);
    var phi = Math.PI * 0.5 - Math.acos(z/dist);
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