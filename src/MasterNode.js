Nightbird.MasterNode = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );

	it.name = 'Master';
	it.isMasterNode = true;
	it.width = 160;
	it.height = 10+160*it.nightbird.height/it.nightbird.width;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.input = null;

	it.context = it.canvas.getContext( '2d' );

	var inputCanvas = new Nightbird.Connector( it, false, 'canvas' );
	inputCanvas.setName( 'input' );
	inputCanvas.onTransfer = function( _data ){
		it.input = _data;
	};
	it.inputs.push( inputCanvas );
	it.move();

	it.contextMenus.pop();
	it.contextMenus.unshift( function(){
		var contextMenu = new Nightbird.ContextMenu( it.nightbird );
		contextMenu.setName( 'Open window' );
		contextMenu.onClick = function(){
			it.openWindow();
		}
		return contextMenu;
	} );

};

Nightbird.MasterNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.MasterNode.prototype.constructor = Nightbird.MasterNode;

Nightbird.MasterNode.prototype.openWindow = function(){

	var it = this;

	it.window = window.open( 'about:blank', 'master', 'width='+it.nightbird.width+',height='+it.nightbird.height+',menubar=no' );

	it.window.document.body.style.padding = 0;
	it.window.document.body.style.margin = 0;
	it.window.document.body.style.overflow = 'hidden';

	it.window.document.body.appendChild( it.canvas );
	it.window.onresize = function(){
		it.canvas.style.width = it.window.innerWidth;
		it.canvas.style.height = it.window.innerHeight;
	};

};

Nightbird.MasterNode.prototype.remove = function(){

	var it = this;

	it.disconnect();

};

Nightbird.MasterNode.prototype.draw = function(){

	var it = this;

	if( it.active ){
		it.context.clearRect( 0, 0, it.canvas.width, it.canvas.height );
		it.context.fillRect( 0, 0, it.canvas.width, it.canvas.height );
		if( it.input ){
			it.context.drawImage( it.input, 0, 0, it.canvas.width, it.canvas.height );
		}
	}

	it.nightbird.modularContext.drawImage( it.canvas, it.posX, 10+it.posY, it.width, it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
