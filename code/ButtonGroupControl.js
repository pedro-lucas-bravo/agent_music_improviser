inlets = 1;
outlets = 2;

var keepActiveFlag = false;
var argsTaskButton = new Array(1);
var activationTime = 50;
var taskbutton;

function keepactive(val){
    keepActiveFlag = val > 0;
}

function list(controlNumber){
    var indexSelected = jsarguments.indexOf(controlNumber);
    if(indexSelected != -1){
        for(var i = 1; i < jsarguments.length; i++){            
            var activate = 0;
            if(jsarguments[i] === controlNumber)
                activate = 127;
            outlet(1, [jsarguments[i] - 11, activate]);                        
        }
        outlet(0, jsarguments[indexSelected]);
        if(!keepActiveFlag){
            argsTaskButton[0] = indexSelected;
            taskbutton = new Task(DeactivateButton, this, argsTaskButton);
            taskbutton.schedule(activationTime);
        }
    }
}

function DeactivateButton(index){    
    outlet(1, jsarguments[index] - 11, 0);
    arguments.callee.task.freepeer();
}

function activationperiod(val){
    activationTime = val;
}