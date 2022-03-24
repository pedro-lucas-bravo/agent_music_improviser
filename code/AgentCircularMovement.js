inlets = 1;
outlets = 1;

include("Vector")
include("cartesian-spherical-polar");

var agentsMovement = new Array(128);
var speed          = 20; 

for(var i = 0; i < agentsMovement.length; i++){
    agentsMovement[i] = {
        position  : new Vector(0.0, 0.0, 0.0),
        polar     : new Vector (0.0, 0.0, 1.0), // aed
    };
}

function MoveAgentProcess(agentId, deltaTime, currentX, currentY, currentZ, dir){
    var agent = agentsMovement[agentId];
    var polarArray = CartesianToSpherical(currentX, currentY, currentZ);
    agent.polar = new Vector(polarArray[0], polarArray[1], polarArray[2]);
    
    agent.polar.x += deltaTime * dir * speed * Math.PI / 180.0;
    if(agent.polar.x >= 2.0 * Math.PI)
        agent.polar.x = 0.0;

    //agent.position.x =  agent.polar.z * Math.cos(agent.polar.x);
    //agent.position.y =  agent.polar.z * Math.sin(agent.polar.x);
    //agent.position.z =  0;
    var cart = SphericalToCartesian(agent.polar.x, agent.polar.y, agent.polar.z);
    agent.position.x = cart[0];
    agent.position.y = cart[1];
    agent.position.z = cart[2];
    return agent;
}

function MoveAgent(agentId, deltaTime, currentX, currentY, currentZ){    
    var agent = MoveAgentProcess(agentId, deltaTime, currentX, currentY, currentZ, 1);
    outlet(0, ["agentpos", agentId, agent.position.x, agent.position.y, agent.position.z]) 
}