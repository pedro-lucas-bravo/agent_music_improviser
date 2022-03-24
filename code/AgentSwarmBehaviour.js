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

function MoveAgentSwarm(agentId, deltaTime, currentX, currentY, currentZ){
    //Get the size
    if(agentId > size - 1)
        size = agentId + 1;    

    var px = new Vector(0,0,0);
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
    outlet(1, "getannpos");

    //Cache current position
    if(agentsMovement[agentId].position.x == 0 && 
        agentsMovement[agentId].position.y == 0 &&
        agentsMovement[agentId].position.z == 0 ){
        
        //Save position in variable
        agentsMovement[agentId].position.x = currentX;
        agentsMovement[agentId].position.y = currentY;
        agentsMovement[agentId].position.z = currentZ;
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
    var currentPos = new Vector(currentX, currentY, currentZ);
    var ptarget = currentPos.add(px.add(agent.position)).divide(3.0);
    //post(agent.position.x);
    //Do a kind of smooth damp (TO DO)

    //Sent result
    outlet(0, ["agentpos", agentId, ptarget.x, ptarget.y, ptarget.z]); 
}

//Just for receivent when request to movement module
var positionFromAnn = new Vector(0, 0, 0);
function agentannpos(x, y, z){
    positionFromAnn = new Vector(x, y, z);
}

function resetagent(agentId){
    agentsMovement[agentId].position.x = 0.0;
    agentsMovement[agentId].position.y = 0.0;
    agentsMovement[agentId].position.z = 0.0;
    agentsMovement[agentId].direction = 1;
    post("reset")
}