include("Vector")
include("AgentCircularMovement");

inlets = 1;
outlets = 2;

var agentsMovement = new Array(128);
var speed          = 20; 
var size           = 0;

for(var i = 0; i < agentsMovement.length; i++){
    agentsMovement[i] = {
        position  : new Vector(0.0, 0.0, 0.0),
        polar     : new Vector (0.0, 0.0, 1.0), // aed
        direction : 1,
    };
}

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}
var lerpTimer = 0;
var lerpSpeed = 0.1;
var currentPx = new Vector(0, 0, 0);
var currentGazeDir = new Vector(0, 0, 0);
function MoveAgentSwarm(agentId, deltaTime, currentX, currentY, currentZ){
    //Get the size
    if(agentId > size - 1)
        size = agentId + 1;    
    //lerpTimer += deltaTime;
    var px = currentPx = Vector.lerp(currentPx, gazePos.multiply(size), deltaTime * lerpSpeed);
    //Calculate next position from others (Px)
    for(var i = 0; i < size; i++){
        if(i != agentId){
            //px = px.add(agentsMovement[i].position);
            px = px.subtract(agentsMovement[i].position);
            var displacement = agentsMovement[i].position.subtract(agentsMovement[agentId].position);            
            //post(displacement.length());
            if(displacement.length() < 0.5){//Check it they are close to change direction
                agentsMovement[i].direction = -1 * agentsMovement[agentId].direction;
                //post("change");
            }
            //post(px.x +" "+px.y +" "+px.z);
        }
    }
    //px = px.divide((size - 1) * 1.0);

    //Request position from ANN
    var gazeData = CalculateGazeData(agentsMovement[agentId].position);
    outlet(1, ["getannpos", gazeData[0], gazeData[1]]);

    //Cache current position
    if(agentsMovement[agentId].position.x == 0 && 
        agentsMovement[agentId].position.y == 0 &&
        agentsMovement[agentId].position.z == 0 ){
        
        //Save position in variable
        agentsMovement[agentId].position.x = currentX;
        agentsMovement[agentId].position.y = currentY;
        //agentsMovement[agentId].position.z = currentZ;
        agentsMovement[agentId].position.z = gazePos.z /*currentZ*/  + (-0.3 + Math.random()* 1.3); // currentZ was changed by gaze position in Z, also range is between -0.3 and 1.0
        agentsMovement[agentId].direction = Math.random() > 0.5 ? 1 : -1;
        post("set");
    }
    //Calculate circular target - use random direction
    var agent = MoveAgentProcess(agentId, deltaTime, 
                            agentsMovement[agentId].position.x, 
                            agentsMovement[agentId].position.y, 
                            agentsMovement[agentId].position.z,
                            agentsMovement[agentId].direction);
    //Save position in variable
    agentsMovement[agentId].position = agent.position.clone();
    //Calculate Ptarget
    //var ptarget = positionFromAnn.add(px).add(agent.position).divide(3.0);
    //var ptarget = agent.position;    
    //var currentPos = new Vector(currentX, currentY, currentZ);

    currentGazeDir = Vector.lerp(currentGazeDir, 
                                gazeDir.multiply(1.0 + Math.random()).multiply(agentsMovement[agentId].direction), 
                                deltaTime * lerpSpeed);

    var div = size <= 1 ? 2.0 : 3.0;
    var ptarget = currentGazeDir.add(px.add(agent.position)).divide(div);
    //ptarget.z = agent.position.z; // Set Z to the initial random value
    zOffset = 0.10;
    ptarget.z += zOffset;
    //post(agent.position.x);
    //Do a kind of smooth damp (TO DO)

    //Sent result
    outlet(0, ["agentpos", agentId, ptarget.x, ptarget.y, ptarget.z]); 
    //outlet(0, ["agentpos", agentId, agent.position.x, agent.position.y, agent.position.z]); 
}

//Just for receivent when request to movement module
var positionFromAnn = new Vector(0, 0, 0);
function agentannpos(x, y, z){
    positionFromAnn = new Vector(x, y, z);
}

var gazePos = new Vector(0, 0, 0);
var gazeDir = new Vector(0, 0, 0);
function gaze(xp, yp, zp, xd, yd, zd){
    gazePos = new Vector(xp * 0.001, yp * 0.001, zp * 0.001);
    gazeDir = new Vector(xd * 0.001, yd * 0.001, zd * 0.001);
}

function CalculateGazeData(agentPosition){
    var displacementAgentGaze = agentPosition.subtract(gazePos);
    var distance = Math.round(displacementAgentGaze.length() * 1000);
    var angle = Math.round(displacementAgentGaze.angleTo(gazeDir) * 180 / Math.PI);
    return [distance, angle];
}

function resetagent(agentId){
    agentsMovement[agentId].position.x = 0.0;
    agentsMovement[agentId].position.y = 0.0;
    agentsMovement[agentId].position.z = 0.0;
    agentsMovement[agentId].direction = 1;
    post("reset")
}