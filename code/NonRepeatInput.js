inlets = 1;
outlets = 1;

var cacheList = new Array();

function list(){
    var inputs = arrayfromargs(messagename,arguments);
    if(!isInList(inputs)){
        cacheList.push(inputs);   
        outlet(0, inputs);
    }
}

function isInList(args){
    if(cacheList.length == 0) return false;
    for(var i = 0; i < cacheList.length; i++){
        var result = true;
        for(var j = 0; j < args.length; j++){            
            result = result && cacheList[i][j] == args[j];
        }
        if(result)
            return true;       
    } 
    return false;   
}