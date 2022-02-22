inlets 	= 1
outlets = 1;

//States
var None_St 				= 0;
var Recording_St			= 1;
var CheckingLoop_St 		= 2;
var Playing_St				= 3;
var Stopped_St				= 4;

var state = None_St; 

var currentTime = 0;
var startRecordTime = 0;
var startLoopTime = 0;
var endRecordTime = 0;
var endLoopTime = 0;

var currentBeats = 0;
var currentUnits = 0;
var currentResolution = 0;

var checkPlay = false;
var checkFirtsEvent = false;

var stopped = false;

var firstEventTime = 0;
var aheadTime = 0;

function startrecord(){
	reset();
	startRecordTime = currentTime;
	//outlet(1, startRecordTime);
	stopped = false;
	state = Recording_St;
}

function startloop(){
	startLoopTime = currentTime
	//outlet(2, startLoopTime);
}

function endrecord(){
	endRecordTime = currentTime;
	//Predicting endloop because it has not happened yet at this point
	endLoopTime = GetNextFirstBeat();
	checkPlay = true;
	state = CheckingLoop_St;
	//outlet(3, endRecordTime);
	//outlet(4, endLoopTime);	
}

function endloop(){
	//endLoopTime = currentTime//no need for this because it affects calculation on limits
	//outlet(5, currentTime);
}

function msg_int(n){
	currentTime = n;
}

function transportdata(beats, units, resolution){
	currentBeats = beats;
	currentUnits = units;
	currentResolution = resolution;
	if (IsReseted()) return;
	switch(state){
		case CheckingLoop_St:
			if(checkFirtsEvent){
				var deltaStart = startLoopTime - startRecordTime;
				if(currentTime >= (endLoopTime - deltaStart + firstEventTime)){
					aheadTime = currentTime - (endLoopTime - deltaStart + firstEventTime);
					if(aheadTime > 0){
						outlet(0,["playatms", firstEventTime + aheadTime]);						
					}else{
						outlet(0,["playatms", firstEventTime]);	
					}									
					UpdateToNextCycle(false);
					//post(startRecordTime +" - "+startLoopTime + " - " + endRecordTime +" - "+endLoopTime);
					state = Playing_St;
				}
			}
			break;
		case Playing_St:
			if(currentTime > startLoopTime)
				state = CheckingLoop_St;
			break;
	}
}

GetNextFirstBeat.local = 1
function GetNextFirstBeat(){
	return currentTime + (4 - currentBeats) * currentResolution + (currentResolution - currentUnits);
}

UpdateToNextCycle.local = 1;
function UpdateToNextCycle(nextFirstBeat){
	var deltaStart = startLoopTime - startRecordTime
	var loopLen = endLoopTime - startLoopTime;
	if(nextFirstBeat){
		startLoopTime = GetNextFirstBeat() - loopLen;
		endLoopTime = startLoopTime + loopLen;
	}else{
		startLoopTime += loopLen;
		endLoopTime += loopLen;
	}	
	var recordLen = endRecordTime - startRecordTime;	
	startRecordTime = startLoopTime - deltaStart;
	endRecordTime = startRecordTime + recordLen;
}

function firstevent(t){
	firstEventTime = parseInt(t);
	checkFirtsEvent = true;
	//post(firstEventTime);
}

function endsignal(){
	//if(!stopped)
	//	checkPlay = true;
}

function play(){
	UpdateToNextCycle(true);
	//post(currentTime + " - " + startRecordTime +" - "+startLoopTime + " - " + endRecordTime +" - "+endLoopTime);
	state = CheckingLoop_St;
}

function stop(){
	state = Stopped_St;
}

function clear(){
	currentTime = 0;
	reset();

	currentBeats = 0;
	currentUnits = 0;
	currentResolution = 0;

	checkPlay = false;

	stopped = true;
	checkFirtsEvent = false;

	state = None_St;
}

function reset(){
	startRecordTime = 0;
	startLoopTime = 0;
	endRecordTime = 0;
	endLoopTime = 0;
}

IsReseted.local = 1
function IsReseted(){
	return startRecordTime == 0 ||
			endRecordTime == 0 || 
			startLoopTime == 0 ||
			endLoopTime == 0;
}