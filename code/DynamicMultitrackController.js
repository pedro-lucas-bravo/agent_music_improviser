inlets = 1;
outlets = 1;

var gateLoopers;
var pluginSelector; 

var maxLoopers              = 128
var loopers                 = new Array(maxLoopers);
var soundGens               = new Array(maxLoopers);
var msgsOpen                = new Array(maxLoopers);
var msgsTrackN              = new Array(maxLoopers);
var currentLooperIndex      = -1;
var baseLeftMargin          = 200;
var baseTopMargin           = 300;
var looperBoxLength         = 150;

function addlooper(){        
    if(currentLooperIndex + 1 < maxLoopers){
        currentLooperIndex++;
        //Instance Looper
        loopers[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin, "Looper.maxpat");
        soundGens[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 40, "SoundGenerator.maxpat");
        msgsOpen[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 80, "message");
        msgsOpen[currentLooperIndex].set("open");
        msgsTrackN[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin + 100, "message");
        msgsTrackN[currentLooperIndex].set(currentLooperIndex);
        
        this.patcher.connect(loopers[currentLooperIndex], 0, soundGens[currentLooperIndex], 0);
        this.patcher.connect(loopers[currentLooperIndex], 1, soundGens[currentLooperIndex], 1);
        this.patcher.connect(msgsOpen[currentLooperIndex], 0, soundGens[currentLooperIndex], 2);
        this.patcher.connect(msgsTrackN[currentLooperIndex], 0, soundGens[currentLooperIndex], 3);
        msgsTrackN[currentLooperIndex].message("bang");

         //Remove and Instance or Re-instance gate
        if(currentLooperIndex > 0){
            this.patcher.remove(gateLoopers);
            this.patcher.remove(pluginSelector);
        }
        gateLoopers = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin - 80, "gate", currentLooperIndex + 1);        

        //Instance pluginSelector
        var argsPluginselector = new Array(currentLooperIndex + 1);
        for(var i = 0; i < currentLooperIndex + 1; i++){
            argsPluginselector[i] = i + 1;   
        }
        pluginSelector = this.patcher.newdefault(baseLeftMargin + currentLooperIndex * looperBoxLength * 0.5, baseTopMargin - 40, "select", argsPluginselector);
        for(var i = 0; i < currentLooperIndex + 1; i++){
            this.patcher.connect(pluginSelector, i, msgsOpen[i], 0);   
        }        

        //Perform connections
        /// Connect gate to loopers        
        for(var i = 0; i < currentLooperIndex + 1; i++){
            this.patcher.connect(gateLoopers, i, loopers[i], 0);   
        }
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
        currentTrack.message("bang");//Bang for choosing the current track
        /// Connect track to selector
        this.patcher.connect(currentTrack, 0, pluginSelector, 0);        
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
        this.patcher.remove(msgsOpen[i]);
        this.patcher.remove(msgsTrackN[i]);
    }
    this.patcher.remove(gateLoopers);
    this.patcher.remove(pluginSelector);
    currentLooperIndex = -1;
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