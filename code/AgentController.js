include("Vector")

inlets = 1;
outlets = 1;

//Initialize variables and constants
var maxAgents             = 128;
var agents                = new Array(maxAgents);
var agent_empty_state     = 0;
var agent_locked_state    = 1;
var agent_released_state  = 2;

var currentAgentID        = -1;
var agentCollectionSize   = 0;

var moveTask              = new Task(UpdateMovement, this);
var deltaTime             = 30;
var speed                 = 20

//Initialize agents
for(var i = 0; i < maxAgents; i++){
    agents[i] = {
        "id"        : i,
        "position"  : new Vector(0.0, 0.0, 0.0),
        "polar"     : new Vector (0.0, 0.0, 1.0), // aed
        "laststate" : agent_empty_state,
        "state"     : agent_empty_state
    };
}

function ChangeAgentState(agentId, newState){
    agents[agentId].laststate = agents[agentId].state;
    agents[agentId].state = newState; 
}

//INITIALIZATION
create();
select(0);


//FUCNTIONS
function create(){    
    if(agentCollectionSize + 1 <= maxAgents){
        currentAgentID = agentCollectionSize;
        agentCollectionSize++;
    }else{
        post("Reached maximun agents: " + maxAgents);
    }
}

function select(agentId){
    currentAgentID = agentId;
    outlet(0, ["select", agentId]);
}

function release(agentId){
    if(agents[agentId].state != agent_locked_state){
        post("Agent " + agentId + " should be locked first");
        return false; //it must be locket e.i. with some recorded content
    }
    ChangeAgentState(agentId, agent_released_state);    
    return true;
}

function releasecurrent(){
    var okrelease = release(currentAgentID);
    if(!okrelease) return;
    // TO DO: movement and music material change for the released agent
    // moveTask.cancel();
    // moveTask.interval = deltaTime;
    // moveTask.repeat();

    var lockAgent = false;
    //Create new agent or bring back previous locked current as actual current
    if(currentAgentID == agentCollectionSize - 1){//It it is the last agent, create a new one
        create();        
    }else{//Bring back the last created
        currentAgentID = agentCollectionSize - 1;
        lockAgent = agents[currentAgentID].laststate == agent_locked_state;  
    }   
    select(currentAgentID);
    if(lockAgent)
        lockcurrent()
}

function lockcurrent(){//Lock is performed when recording finishes
    ChangeAgentState(currentAgentID, agent_locked_state);
}

function lock(agentId){//Lock is performed when agent is caught
    if(agentId < agentCollectionSize){
        if(agents[agentId].state != agent_released_state) return; //It should be released to lock
        if(agents[currentAgentID].state == agent_locked_state)// If not locked means empty and will be apart
            release(currentAgentID);
        select(agentId);
        lockcurrent();
    }
}

function stop(){
    moveTask.cancel();
}

function restart(){
    currentAgentID        = -1;
    agentCollectionSize   = 0;
    create();
    select(0);
}

function UpdateMovement(){
    var dt = deltaTime * 0.001;
    for(var i = 0; i < 5; i++){
        agents[i].polar.x += dt * speed * Math.PI / 180.0;
        if(agents[i].polar.x >= 2.0 * Math.PI)
            agents[i].polar.x = 0.0;
        
        agents[i].position.x =  agents[i].polar.z * Math.cos(agents[i].polar.x);
        agents[i].position.y =  agents[i].polar.z * Math.sin(agents[i].polar.x);
        agents[i].position.z =  i;

        outlet(0, ["agent" + i, agents[i].position.x * 1000, agents[i].position.y * 1000, agents[i].position.z * 1000]);
    }
}
UpdateMovement.local = 1;