inlets 	= 1
outlets = 1;

var dictNote = new Dict("heldnotes");

function clear(){
    dictNote = new Dict("heldnotes");
}

function list(val){    
    if(arguments.length == 2){//If list is 2 elements, it is a midi note input pair
        var note = arguments[0];
        var velocity = arguments[1];
        if(dictNote[note] === undefined && velocity > 0){
            dictNote[note] = 1;
        }
        else{
            if(velocity > 0)
                dictNote[note] += 1;
            else
                dictNote[note] -= 1;
        }        
    }    
}

function heldnotes(){
    for(var note in dictNote){
        if(dictNote[note] > 0){
            outlet(0, [parseInt(note), 0]);
        }   
    }    
}