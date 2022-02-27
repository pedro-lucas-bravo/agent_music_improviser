inlets 	= 1
outlets = 1;

var trackId = 0;

function msg_int(val){
    trackId = val;
}

function dictionary(dictName)
{
    try{
        var dict = new Dict(dictName);
        var jsObject = JSON.parse(dict.stringify())
        outlet(0, ["firstevent", jsObject.tracks[trackId].events[0].time]);
    }catch(err){
        //Avoid exception when there are no events
        //post(err);
    }
}