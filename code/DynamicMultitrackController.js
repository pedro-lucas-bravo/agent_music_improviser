inlets = 1;
outlets = 1;

var maxLoopers              = 128
var loopers                 = new Array(maxLoopers);
var currentLooperIndex      = -1;
var baseLeftMargin          = 300;
var baseTopMargin           = 100;
var looperBoxLength         = 100;

function addlooper(){
    if(currentLooperIndex + 1 < maxLoopers){
         currentLooperIndex++;
         loopers[currentLooperIndex] = this.patcher.newdefault(baseLeftMargin+(currentLooperIndex*looperBoxLength), baseTopMargin, "Looper.maxpat");
    }else{
        post("Cannot create more than " +maxLoopers+ " loopers.")
    }
}

function removeallloopers(){
    for(var i=0;i<currentLooperIndex + 1;i++){
        this.patcher.remove(loopers[i]);
    }
    currentLooperIndex = -1;
}