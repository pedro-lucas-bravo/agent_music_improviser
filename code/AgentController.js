include("Vector");
include("AgentAutonomousMovement");

inlets = 1;
outlets = 3;

//Initialize variables and constants
var maxAgents             = 128;
var agents                = new Array(maxAgents);
var agent_empty_state     = 0;
var agent_locked_state    = 1;
var agent_released_state  = 2;

var currentAgentID        = -1;
var agentCollectionSize   = 0;

var mainAgentsTask        = new Task(UpdateAgents, this);
var deltaTime             = 30;
//var speed                 = 20

//Initialize agents
for(var i = 0; i < maxAgents; i++){
    agents[i] = {
        id        : i,
        position  : new Vector(0.0, 1.0, 0.0),
        laststate : agent_empty_state,
        state     : agent_empty_state
    };
}

loadbang();//COMMENT THIS LINE WHEN DEV IS READY

//INITIALIZATION
function loadbang(){
    restart();
}

//FUNCTIONS

function ChangeAgentState(agentId, newState){
    if(agentId < agentCollectionSize){
        agents[agentId].laststate = agents[agentId].state;
        agents[agentId].state = newState; 
    }
}

function startbehavior(){
    mainAgentsTask.cancel();
    mainAgentsTask.interval = deltaTime;
    mainAgentsTask.repeat();
}

function create(){    
    if(agentCollectionSize + 1 <= maxAgents){
        currentAgentID = agentCollectionSize;
        agentCollectionSize++;
        return true;
    }else{
        post("Reached maximun agents: " + maxAgents);
        return false;
    }
}

function select(agentId){
    currentAgentID = agentId;
    outlet(0, ["select", agentId]);
}

function release(agentId){
    if(agentId >= agentCollectionSize){
        post("Agent " + agentId + " is out of maximun amount. No action performed");
        return false;
    }
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

    var lockAgent = false;
    var success = true;
    //Create new agent or bring back previous locked current as actual current
    if(currentAgentID == agentCollectionSize - 1){//It it is the last agent, create a new one
        success = create();
    }else{//Bring back the last created
        currentAgentID = agentCollectionSize - 1;
        lockAgent = agents[currentAgentID].laststate == agent_locked_state;  
    }   

    if(success){
        select(currentAgentID);
        if(lockAgent)
            lockcurrent()
    }else{
        //Select and set a currentId as the collection size, it allows to avoid interaction ovr agents size
        select(agentCollectionSize);
    }
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
    mainAgentsTask.cancel();
}

function restart(){
    for(var i = 0; i < agentCollectionSize; i++){
        agents[i].state = agents[i].laststate = agent_empty_state;      
    }
    currentAgentID        = -1;
    agentCollectionSize   = 0;
    create();
    select(0);
    startbehavior();
}

///////// AGENTS BEHAVIOUR

function UpdateAgents(){
    var dt = deltaTime * 0.001;
    var allPositions = ["/agents"];
    for(var i = 0; i < agentCollectionSize; i++){
        switch(agents[i].state){
            case agent_released_state:
                var position = agents[i].position = MoveAgent(i, dt, agents[i].position);
                var positionMM = [parseInt(position.x * 1000), parseInt(position.y * 1000), parseInt(position.z * 1000)];
                outlet(1, ["agent", i, positionMM[0], positionMM[1], positionMM[2]]);
                allPositions = allPositions.concat(positionMM);
            break;
        }        
    }    
    if(agentCollectionSize > 0 && allPositions.length > 1){
        //post(allPositions + ' size ' + allPositions.length);
        outlet(2, allPositions);
    }
}
UpdateAgents.local = 1;