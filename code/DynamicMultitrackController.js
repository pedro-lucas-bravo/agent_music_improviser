inlets = 1;
outlets = 1;

var gateLoopers;
var gatePositions;
var pluginSelector;
var loadBang;
var loadBangTrigger;
var closeBang;
var msgClearAll;
var msgStopAll;
var routeSpatMsgs;
var gateSpatMsgs;
var agentDataSelector;
var gateSyntheParams;

var maxLoopers              = 128
var loopers                 = new Array(maxLoopers);
var soundGens               = new Array(maxLoopers);
var msgsTrackN              = new Array(maxLoopers);
var msgsOpen                = new Array(maxLoopers);
var msgsSave                = new Array(maxLoopers);
var msgsLoad                = new Array(maxLoopers);
//var agentDataSelector       = new Array(maxLoopers);
var msgsAgentPosition       = new Array(maxLoopers);
var msgsOpenSpat            = new Array(maxLoopers);
var currentLooperIndex      = -1;
var baseLeftMargin          = 650;
var baseTopMargin           = 500;
var looperBoxLength         = 150;

function addlooper(){        
    if(currentLooperIndex + 1 < maxLoopers){
        currentLooperIndex++;
        //Instance Looper
        loopers[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin, "Looper.maxpat");
        soundGens[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 280, "SoundGenerator.maxpat");        
        msgsTrackN[currentLooperIndex] = this.patcher.newobject("message", baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 40, 30, 10);
        msgsTrackN[currentLooperIndex].set(currentLooperIndex);
        //msgsOpen[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 80, "message");
        msgsOpen[currentLooperIndex] = this.patcher.newobject("message", baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 120, 35, 10);
        msgsOpen[currentLooperIndex].set("open");
        msgsSave[currentLooperIndex] = this.patcher.newobject("message", baseLeftMargin+(currentLooperIndex*looperBoxLength) + 40, baseTopMargin + 120, 35, 10);
        msgsSave[currentLooperIndex].set("save");
        msgsLoad[currentLooperIndex] = this.patcher.newobject("message", baseLeftMargin+(currentLooperIndex*looperBoxLength) + 80, baseTopMargin + 120, 35, 10);
        msgsLoad[currentLooperIndex].set("load");

        //agentDataSelector[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 160, "select " + currentLooperIndex);
        msgsAgentPosition[currentLooperIndex] = this.patcher.newobject("message", baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 200, 100, 10);        

        msgsOpenSpat[currentLooperIndex] = this.patcher.newobject("message", baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 240, 80, 10);
        msgsOpenSpat[currentLooperIndex].set("/window/open");
        
        this.patcher.connect(loopers[currentLooperIndex], 0, soundGens[currentLooperIndex], 0);
        this.patcher.connect(loopers[currentLooperIndex], 1, soundGens[currentLooperIndex], 1);
        this.patcher.connect(msgsOpen[currentLooperIndex], 0, soundGens[currentLooperIndex], 2);   
        this.patcher.connect(msgsTrackN[currentLooperIndex], 0, soundGens[currentLooperIndex], 3);             
        this.patcher.connect(msgsSave[currentLooperIndex], 0, soundGens[currentLooperIndex], 4);        
        this.patcher.connect(msgsLoad[currentLooperIndex], 0, soundGens[currentLooperIndex], 4);
        this.patcher.connect(msgsLoad[currentLooperIndex], 0, soundGens[currentLooperIndex], 4);
        //this.patcher.connect(agentDataSelector[currentLooperIndex], 0, msgsAgentPosition[currentLooperIndex], 0);
        this.patcher.connect(msgsAgentPosition[currentLooperIndex], 0, soundGens[currentLooperIndex], 5);
        this.patcher.connect(msgsOpenSpat[currentLooperIndex], 0, soundGens[currentLooperIndex], 6);

        msgsTrackN[currentLooperIndex].message("bang");
        msgsLoad[currentLooperIndex].message("bang");

         //Remove and Instance or Re-instance gate
        if(currentLooperIndex > 0){
            this.patcher.remove(gateLoopers);
            this.patcher.remove(gatePositions);
            this.patcher.remove(pluginSelector);
            this.patcher.remove(loadBang);
            this.patcher.remove(loadBangTrigger);
            this.patcher.remove(closeBang);
            this.patcher.remove(msgClearAll);
            this.patcher.remove(msgStopAll);
            this.patcher.remove(routeSpatMsgs);
            this.patcher.remove(gateSpatMsgs); 
            this.patcher.remove(agentDataSelector);
            this.patcher.remove(gateSyntheParams);
        }

        gateLoopers = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin - 80, "gate", currentLooperIndex + 2);
        gatePositions = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5 + looperBoxLength, baseTopMargin - 80, "gate", currentLooperIndex + 2);
        gateSyntheParams = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5 + looperBoxLength, baseTopMargin + 160, "gate", currentLooperIndex + 2);
        loadBang = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin - 160, "loadbang");        
        loadBangTrigger = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin - 120, "t b b");        
        this.patcher.connect(loadBang, 0, loadBangTrigger, 0);
        closeBang = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin + 80, "closebang");
        msgClearAll = this.patcher.newobject("message", baseLeftMargin + 40, baseTopMargin -80, 35, 10);
        msgClearAll.set("clear");
        var globalStop = this.patcher.getnamed("global_stop");
        msgStopAll = this.patcher.newobject("message", baseLeftMargin, baseTopMargin -80, 35, 10);
        msgStopAll.set("stop");
        this.patcher.connect(globalStop, 0, msgStopAll, 0);
        var agentController = this.patcher.getnamed("agent_controller");
        routeSpatMsgs = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5 + 2 * looperBoxLength, baseTopMargin - 120, "route int");
        gateSpatMsgs = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5 + 2 * looperBoxLength, baseTopMargin - 80, "gate", currentLooperIndex + 2);
        this.patcher.connect(agentController, 3, routeSpatMsgs, 0);
        this.patcher.connect(routeSpatMsgs, 0, gateSpatMsgs, 0);
        this.patcher.connect(routeSpatMsgs, 1, gateSpatMsgs, 1);
        var msgSpBinaural = this.patcher.getnamed("sp_binaural");
        var msgSpAmbisonic = this.patcher.getnamed("sp_ambisonic");
        this.patcher.connect(msgSpBinaural, 0, soundGens[currentLooperIndex], 7);
        this.patcher.connect(msgSpAmbisonic, 0, soundGens[currentLooperIndex], 7);
        this.patcher.connect(soundGens[currentLooperIndex], 0, agentController, 0);


        //Instance pluginSelector
        var argsPluginselector = new Array(currentLooperIndex + 1);
        var argsAgentSelector = new Array(currentLooperIndex + 1);
        for(var i = 0; i < currentLooperIndex + 1; i++){
            argsPluginselector[i] = i + 1;  
            argsAgentSelector[i] = i; 
        }
        pluginSelector = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin - 40, "select", argsPluginselector);
        for(var i = 0; i < currentLooperIndex + 1; i++){
            this.patcher.connect(pluginSelector, i, msgsOpen[i], 0);   
        } 
        agentDataSelector = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin + 160, "select", argsAgentSelector);
        var fullagentpos_unpack = this.patcher.getnamed("fullagentpos_unpack");
        this.patcher.connect(fullagentpos_unpack, 0, agentDataSelector, 0);
        for(var i = 0; i < currentLooperIndex + 1; i++){            
            this.patcher.connect(agentDataSelector, i, msgsAgentPosition[i], 0);            
        } 

        //Perform connections        
        /// Connet inputs to gate 
        var midiinfo_in = this.patcher.getnamed("midiinfo_in");
        this.patcher.connect(midiinfo_in, 0, gateLoopers, 1);
        var midiinfo_in_key = this.patcher.getnamed("midiinfo_in_key");
        this.patcher.connect(midiinfo_in_key, 0, gateLoopers, 1);
        var msg_startrecord = this.patcher.getnamed("msg_startrecord");
        this.patcher.connect(msg_startrecord, 0, gateLoopers, 1);
        var msg_endrecord = this.patcher.getnamed("msg_endrecord");
        this.patcher.connect(msg_endrecord, 0, gateLoopers, 1);
        var msg_play = this.patcher.getnamed("msg_play");
        this.patcher.connect(msg_play, 0, gateLoopers, 1);
        var msg_stop = this.patcher.getnamed("msg_stop");
        this.patcher.connect(msg_stop, 0, gateLoopers, 1);
        var msg_clear = this.patcher.getnamed("msg_clear");
        this.patcher.connect(msg_clear, 0, gateLoopers, 1);

        /// Connect to current Track
        var currentTrack = this.patcher.getnamed("current_track");
        this.patcher.connect(currentTrack, 0, gateLoopers, 0);       

        /// Connect track to selector
        this.patcher.connect(currentTrack, 0, pluginSelector, 0);

        /// Connect track to gate positions
        this.patcher.connect(currentTrack, 0, gatePositions, 0);

        /// Connect positions source to gate positions
        var inlet_positions = this.patcher.getnamed("inlet_positions");
        this.patcher.connect(inlet_positions, 0, gatePositions, 1);

        /// Connect track to gate synthe params
        this.patcher.connect(currentTrack, 0, gateSyntheParams, 0);

        /// Connect positions source to gate synthe params
        var msg_volume = this.patcher.getnamed("msg_volume");
        this.patcher.connect(msg_volume, 0, gateSyntheParams, 1);

        /// connect positions to controllers        
        var agentpos_unpack = this.patcher.getnamed("agentpos_unpack");        
        this.patcher.connect(agentpos_unpack, 0, msgsAgentPosition[currentLooperIndex], 1);

        /// Connect 

        /// Connect individual elements  
        for(var i = 0; i < currentLooperIndex + 1; i++){
            this.patcher.connect(gateLoopers, i, loopers[i], 0);   
            this.patcher.connect(gatePositions, i, soundGens[i],5);
            this.patcher.connect(loadBangTrigger, 0, msgsLoad[i], 0);
            this.patcher.connect(loadBangTrigger, 1, msgsTrackN[i], 0);
            this.patcher.connect(closeBang, 0, msgsSave[i], 0);
            this.patcher.connect(msgClearAll, 0, loopers[i], 0);
            this.patcher.connect(msgStopAll, 0, loopers[i], 0);
            this.patcher.connect(gateSpatMsgs, i, soundGens[i],6);
            this.patcher.connect(gateSyntheParams, i, soundGens[i],8);
        }  

        //Bang for choosing the current track
        currentTrack.message("bang");
        
        //Bang for choosing binaural render
        msgSpBinaural.message("bang");
    }else{
        post("Cannot create more than " +maxLoopers+ " loopers.")
    }
}

function createloopers(n){
    if(n < 1) n = 1;
    if(n > maxLoopers) n = maxLoopers; 
    for(var i=0;i < n;i++){
        addlooper();
    }
}

function removeallloopers(){
    for(var i=0;i<currentLooperIndex + 1;i++){
        this.patcher.remove(loopers[i]);
        this.patcher.remove(soundGens[i]);        
        this.patcher.remove(msgsTrackN[i]);
        this.patcher.remove(msgsOpen[i]);
        this.patcher.remove(msgsSave[i]);
        this.patcher.remove(msgsLoad[i]);
        //this.patcher.remove(agentDataSelector[i]);
        this.patcher.remove(msgsAgentPosition[i]);
        this.patcher.remove(msgsOpenSpat[i]);
    }
    this.patcher.remove(gateLoopers);
    this.patcher.remove(gatePositions);
    this.patcher.remove(pluginSelector);
    this.patcher.remove(loadBang);
    this.patcher.remove(loadBangTrigger);
    this.patcher.remove(closeBang);
    this.patcher.remove(msgClearAll);
    this.patcher.remove(msgStopAll);
    this.patcher.remove(routeSpatMsgs);
    this.patcher.remove(gateSpatMsgs);
    this.patcher.remove(agentDataSelector);
    this.patcher.remove(gateSyntheParams);
    currentLooperIndex = -1;
    gc();
}

// var testObj;
// function test(){
//     if(testObj != null){
//         this.patcher.remove(testObj);
//     }
//     var currentTrack = this.patcher.getnamed("current_track");
//     testObj = this.patcher.newdefault(currentTrack.rect[0] + 20, currentTrack.rect[1] + 40, "button");
//     this.patcher.connect(currentTrack, 0, testObj, 0);  
//     currentTrack.message("bang");
// }