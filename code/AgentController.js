include("Vector");
include("AgentAutonomousMovement");

inlets = 1;
outlets = 5;
////outet description
// 0: For 'select' message 
// 1: For individual agent position (millimeters) message 'agent id x y z' (e.g. agent 0 100 150 230)
// 2: For sending message about agents like 'note' and for all released agents position (millimeters) message '/agents id0 x0 y0 z0 id1 x1 y1 z1.....'
// 3: For indicate firs 'track' number (index + 1), then color message to spat '/source/1/color r g b a'
// 4: For an external command to instantiate N agents, and every agent with 
    // their respective state (s) and color (hex) '/agent/instance N s0 hex0 s1 hex1...' (sent to visualizer)

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
        color     : new Vector(0.490196, 1.0, 0.0),// Default color from spat (kind of green)
        volume    : 0.5  
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
    SendPositionToAgent(currentAgentID, currentPositionSensor);
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

function SendPositionToAgent(agentId, position){
    var positionMM = [agentId, Math.round(position.x * 1000), Math.round(position.y * 1000), Math.round(position.z * 1000)];
    outlet(1, ["agent", agentId, positionMM[1], positionMM[2], positionMM[3]]);
    return positionMM;
}
SendPositionToAgent.local = 1;

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
        var toRand = getRndInteger(0, 4) / 4.0;
        agents[i].color.x = toOne == 0 ? 1.0 : (toZero == 0 ? 0 : toRand);
        agents[i].color.y = toOne == 1 ? 1.0 : (toZero == 1 ? 0 : toRand);
        agents[i].color.z = toOne == 2 ? 1.0 : (toZero == 2 ? 0 : toRand);
        outlet(3, i + 1);
        outlet(3, ["/source/1/color", agents[i].color.x, agents[i].color.y, agents[i].color.z, 1.0]);
    }
}

function instanceExternalAgents(size){
    size = Math.min(size, maxAgents);
    var msg = ["/agent/instance", size]
    for(var i = 0; i < size; i++){
        msg = msg.concat(
            [
                agents[i].state,
                rgbToHex(
                    parseInt(agents[i].color.x * 255), 
                    parseInt(agents[i].color.y * 255), 
                    parseInt(agents[i].color.z * 255), 
                    false
                    ),
                agents[i].volume
            ]
                );
    }
    outlet(4, msg);
}

function externalSelect(agentID){
    if(agentID >=0 && agentID < agentCollectionSize){
        switch(agents[agentID].state){
            case agent_locked_state://It means current is locked, then release
                releasecurrent();                
                break;
            case agent_released_state://If in relased, it means it was caught, so lock it
                lock(agentID);
            break;
        }
    }else{
        post("Agent ID " + agentID + " is not part of the collection.");
    }
}

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
componentToHex.local = 1;
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
rgbToHex.local = 1;
function rgbToHex(r, g, b, includeSharp) {
    var result = componentToHex(r) + componentToHex(g) + componentToHex(b);    
    return includeSharp ? "#" + result : result;
}

function note(){
    if(arguments[2] != 0)
        outlet(2,["/note", arguments[0], arguments[1], arguments[2]]);// /note agentId notePitch noteVelocity    
}

function volume(){
    agents[arguments[0]].volume = arguments[1];
    outlet(2,["/volume", arguments[0], arguments[1]]);// /note agentId volume (0 - 1)   
}

///////// AGENTS BEHAVIOUR

function UpdateAgents(){
    var dt = deltaTime * 0.001;

    //For all agents (released size, agentId-emptyorlocked-, state, x, y, z, ...rest released agents (except state))    
    var allAgentsInfo = ["/agents", 
                        currentAgentID, 
                        agents[currentAgentID].state,
                        Math.round(currentPositionSensor.x * 1000),
                        Math.round(currentPositionSensor.y * 1000),
                        Math.round(currentPositionSensor.z * 1000),
                        -1//here will be the released agents size
                    ];
    var releasedAgents = 0;
    for(var i = 0; i < agentCollectionSize; i++){
        switch(agents[i].state){
            case agent_released_state:
                var position = agents[i].position = MoveAgent(i, dt, agents[i].position);
                var positionMM = SendPositionToAgent(i, position);
                allAgentsInfo = allAgentsInfo.concat(positionMM);
                releasedAgents++;
            break;
        }        
    }       
    allAgentsInfo[6] = releasedAgents;
    outlet(2, allAgentsInfo);
}
UpdateAgents.local = 1;