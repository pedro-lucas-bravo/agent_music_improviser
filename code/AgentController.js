include("Vector");
include("AgentAutonomousMovement");

inlets = 1;
outlets = 4;

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

var currentPositionSensor = new Vector(0.0, 0.0, 0.0);  

//Initialize agents
for(var i = 0; i < maxAgents; i++){
    agents[i] = {
        id        : i,
        position  : new Vector(0.0, 1.0, 0.0),
        laststate : agent_empty_state,
        state     : agent_empty_state,
        color     : new Vector(0.490196, 1.0, 0.0)// Default color from spat (kind of green)
    };
}

loadbang();//COMMENT THIS LINE WHEN DEV IS READY

//INITIALIZATION
function loadbang(){
    restart();
}

//AGENT INTERFACE

function ChangeAgentState(agentId, newState){
    if(agentId < agentCollectionSize){
        agents[agentId].laststate = agents[agentId].state;
        agents[agentId].state = newState;
        if(newState == agent_released_state){//Set current position as initial one
            agents[agentId].position.set(currentPositionSensor);
        }
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

function list(val){
    if(arguments.length == 3){//If list is 3 elements, it is a position vector
        //IMPORTANT: It is assumed that value are received in milimeters, so it converts to meters
        currentPositionSensor.x = arguments[0] * 0.001;
        currentPositionSensor.y = arguments[1] * 0.001;
        currentPositionSensor.z = arguments[2] * 0.001;
    }    
}

function GenerateColors(){
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
    var lastOne = 0;
    for(var i = 0; i < agents.length; i++){
        //Try to get bright colors by keeping one component in zero and other in one
        var toOne = getRndInteger(0, 2);        
        lastOne = toOne = toOne == lastOne ? (toOne + 1) % 3 : toOne;        
        var toZero  = getRndInteger(0, 2);
        toZero = toZero == toOne ? (toZero + 1) % 3 : toZero;
        agents[i].color.x = toOne == 0 ? 1.0 : (toZero == 0 ? 0 : getRndInteger(0, 255) / 255.0);
        agents[i].color.y = toOne == 1 ? 1.0 : (toZero == 1 ? 0 : getRndInteger(0, 255) / 255.0);
        agents[i].color.z = toOne == 2 ? 1.0 : (toZero == 2 ? 0 : getRndInteger(0, 255) / 255.0);
        outlet(3, i + 1);
        outlet(3, ["/source/1/color", agents[i].color.x, agents[i].color.y, agents[i].color.z, 1.0]);
    }
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