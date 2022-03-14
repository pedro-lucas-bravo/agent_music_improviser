inlets = 1;
outlets = 5;

/// OUTLET DESCRIPTION

/// 0: Index selection
/// 1: Generate new states (bang)
/// 2: MIDI in
/// 3: Build (bang)
/// 4: Reset (bang)

var maxSize                 = 99;
var markovInstances         = new Array(maxSize);
var msgOutputs              = new Array(maxSize);
var markovSize              = 0;

var gateNewStates;
var gateMidiIn;
var gateBuild;
var gateReset;

var baseLeftMargin          = 50;
var baseTopMargin           = 200;
var elementBoxLength        = 150;

/// INSTANTIATION and REMOVAL

function instantiate(n){
    removeall();
    
    gateNewStates = this.patcher.newdefault(baseLeftMargin, baseTopMargin - 40, "gate", n);
    gateMidiIn = this.patcher.newdefault(baseLeftMargin + 1 * elementBoxLength, baseTopMargin - 40, "gate", n);
    gateBuild = this.patcher.newdefault(baseLeftMargin + 2 * elementBoxLength, baseTopMargin - 40, "gate", n);
    gateReset = this.patcher.newdefault(baseLeftMargin + 3 * elementBoxLength, baseTopMargin - 40, "gate", n);

    this.patcher.connect(this.box, 0, gateNewStates, 0);
    this.patcher.connect(this.box, 0, gateMidiIn, 0);
    this.patcher.connect(this.box, 0, gateBuild, 0);
    this.patcher.connect(this.box, 0, gateReset, 0);

    this.patcher.connect(this.box, 1, gateNewStates, 1);
    this.patcher.connect(this.box, 2, gateMidiIn, 1);
    this.patcher.connect(this.box, 3, gateBuild, 1);
    this.patcher.connect(this.box, 4, gateReset, 1);  
    
    var midi_out = this.patcher.getnamed("midi_out");

    for(var i = 0; i < n; i++){    
        markovInstances[i] = this.patcher.newdefault(baseLeftMargin+(i*elementBoxLength), baseTopMargin, "bpatcher Markov_Chain_UI.maxpat");        
        msgOutputs[i] = this.patcher.newobject("message", baseLeftMargin+(i*elementBoxLength), baseTopMargin + 140, 50, 10);
        msgOutputs[i].set([i, "$1", "$2"]);        
        
        this.patcher.connect(gateNewStates, i, markovInstances[i], 0);
        this.patcher.connect(gateMidiIn, i, markovInstances[i], 1);
        this.patcher.connect(gateBuild, i, markovInstances[i], 2);
        this.patcher.connect(gateReset, i, markovInstances[i], 3);

        this.patcher.connect(markovInstances[i], 0, msgOutputs[i], 0);
        this.patcher.connect(msgOutputs[i], 0, midi_out, 0);
    }    
    markovSize = n;
}

function removeall(){
    this.patcher.remove(gateNewStates);
    this.patcher.remove(gateMidiIn);
    this.patcher.remove(gateBuild);
    this.patcher.remove(gateReset);
    for(var i = 0; i < maxSize; i++){
       this.patcher.remove(markovInstances[i]);
       this.patcher.remove(msgOutputs[i]);
    } 
}

/// MESSAGES

var currentId = -1;

function startlisten(id){
    currentId = id;
    outlet(0, currentId + 1);
}

function stoplisten(){
    currentId = -1;
    outlet(0, 0);
}

function startperformance(){
    outlet(1, 1);
}

function stopperformance(){
    outlet(1, 0);
}

function startperformanceat(id){
    outlet(0, id + 1);// activate this id for a moment
    outlet(1, 1); //send signal
    startlisten(currentId);//Return to the current id
}

function stopperformanceat(id){
    outlet(0, id + 1);// activate this id for a moment
    outlet(1, 0); //send signal
    startlisten(currentId);//Return to the current id
}

//MIDI in
function list(val){    
    if(arguments.length == 2){//If list is 2 elements, it is a midi note input pair
        outlet(2, [arguments[0], arguments[1]]);
    }    
}

function train(){
    outlet(3, "bang");
}

function reset(){
    stopperformance();
    outlet(4, "bang");    
}

function resetat(id){
    stopperformanceat(id);
    outlet(0, id + 1);// activate this id for a moment
    outlet(4, "bang");
    startlisten(currentId);//Return to the current id   
}

function resetall(){
    for(var i = 0; i < markovSize; i++){
        resetat(i);
    }
    outlet(0, 0);//close all
    currentId =  -1;
}

