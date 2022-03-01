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

function MoveAgent(agentId, deltaTime, currentPosition){
    var agent = agentsMovement[agentId];
    var polarArray = CartesianToSpherical(currentPosition);
    agent.polar = new Vector(polarArray[0], polarArray[1], polarArray[2]);
    agent.polar.x += deltaTime * speed * Math.PI / 180.0;
    if(agent.polar.x >= 2.0 * Math.PI)
        agent.polar.x = 0.0;
    agent.position.x =  agent.polar.z * Math.cos(agent.polar.x);
    agent.position.y =  agent.polar.z * Math.sin(agent.polar.x);
    agent.position.z =  0;

    return agent.position; 
}