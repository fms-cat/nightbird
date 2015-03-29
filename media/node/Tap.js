Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Tap';
	it.width = 100;
	it.height = 100;

	it.beat = 0;
	it.firstTap = 0;
	it.lastTap = 0;
	it.contTap = 0;
	it.isTapping = false;
	it.lastNow = +new Date();
	it.bpm = 120;
	it.rbpm = 120;
	it.isRound = false;

	var outputBpm = new Nightbird.Connector( it, true, 'number' );
	outputBpm.setName( 'bpm' );
	outputBpm.onTransfer = function(){
		return Number( it.isRound ? it.rbpm : it.bpm );
	};
	it.outputs.push( outputBpm );
	var outputBeat = new Nightbird.Connector( it, true, 'number' );
	outputBeat.setName( 'beat' );
	outputBeat.onTransfer = function(){
		return Number( it.beat );
	};
	it.outputs.push( outputBeat );
	it.move();

	it.contextMenus.unshift( function(){
		var contextMenu = new Nightbird.ContextMenu( it.nightbird );
		contextMenu.setName( ( function(){
			return it.isRound ? 'Disable round' : 'Enable round';
		}() ) );
		contextMenu.onClick = function(){
			it.isRound = !it.isRound;
		}
		return contextMenu;
	} );

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.operateDown = function( _x, _y ){

	var it = this;

	if( Math.abs( _x-50 ) < 38 && Math.abs( _y-45 ) < 30 ){
		it.operateTap = true;
		var now = +new Date();
		if( it.isTapping ){
			it.contTap ++;
			it.beat = it.contTap;
			it.bpm = 60000/( now-it.firstTap )*it.contTap;
			it.rbpm = Math.round( it.bpm );
		}else{
			it.isTapping = true;
			it.contTap = 0;
			it.beat = 0;
			it.firstTap = now;
		}
		it.lastTap = now;
		return true;
	}
	if( Math.abs( _x-30 ) < 18 && Math.abs( _y-85 ) < 6 ){
		it.operateAdjust = true;
		it.operateLastY = _y;
		return true;
	}
	if( Math.abs( _x-70 ) < 18 && Math.abs( _y-85 ) < 6 ){
		it.operateNudge = true;
		it.operateLastY = _y;
		return true;
	}
	return false;

};

Node.prototype.operateMove = function( _x, _y ){

	var it = this;

	if( it.operateAdjust ){
		it.bpm += Number( ( (it.operateLastY-_y)*.1 ).toFixed(1) );
		it.rbpm = Math.round( it.bpm );
		it.operateLastY = _y;
	}
	if( it.operateNudge ){
		it.beat += Number( ( (it.operateLastY-_y)*.01 ).toFixed(2) );
		it.operateLastY = _y;
	}

};

Node.prototype.operateUp = function(){

	var it = this;

	if( it.operateTap ){
		it.operateTap = false;
	}
	if( it.operateAdjust ){
		it.operateAdjust = false;
	}
	if( it.operateNudge ){
		it.operateNudge = false;
	}

};

Node.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.bpm = it.bpm;
	obj.rbpm = it.rbpm;
	obj.isRound = it.isRound;
	return obj;

};

Node.prototype.draw = function(){

	var it = this;

	if( it.active ){
		var now = +new Date();
		if( it.isTapping && 2000 < now - it.lastTap ){
			it.isTapping = false;
		}
		var bpm = it.isRound ? it.rbpm : it.bpm;
		it.beat += ( now-it.lastNow )*1e-3*bpm/60.;
		it.lastNow = now;
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	it.nightbird.modularContext.fillStyle = 'rgb( 85,85,85 )';
	it.nightbird.modularContext.fillStyle = it.operateTap ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+12, it.posY+15, 76, 60 );
	var beatCol = Math.floor( Math.exp( -(it.beat%1)*4 )*255 );
	it.nightbird.modularContext.strokeStyle = 'rgb( '+beatCol+','+beatCol+','+beatCol+' )';
	it.nightbird.modularContext.strokeRect( it.posX+12, it.posY+15, 76, 60 );
	it.nightbird.modularContext.fillStyle = it.operateAdjust ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+12, it.posY+79, 36, 12 );
	it.nightbird.modularContext.fillStyle = it.operateNudge ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+52, it.posY+79, 36, 12 );
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillStyle = it.isTapping ? '#9bd' : '#ddd';
	it.nightbird.modularContext.fillText( ( it.isRound ? it.rbpm : it.bpm ).toFixed(2)+' bpm', it.posX+50, it.posY+40 );
	it.nightbird.modularContext.fillText( it.beat.toFixed(2)+' beat', it.posX+50, it.posY+50 );
	it.nightbird.modularContext.fillStyle = '#ddd';
	it.nightbird.modularContext.fillText( 'adjust', it.posX+30, it.posY+85 );
	it.nightbird.modularContext.fillText( 'nudge', it.posX+70, it.posY+85 );

	Nightbird.Node.prototype.draw.call( it );

};
