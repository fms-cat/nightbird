Nightbird.dist = function( _x1, _y1, _x2, _y2 ){
  return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
};

Nightbird.black1x1 = new Image();
Nightbird.black1x1.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACwAAAAAAQABAAACAkQBADs=';

Nightbird.arrayToString = function( _array ){
  // http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
  var decoder = new TextDecoder( 'utf-8' );
  var str = decoder.decode( _array );
  return str;
};

Nightbird.stringToArray = function( _str ){
  // http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
  var encoder = new TextEncoder( 'utf-8' );
  var array = encoder.encode( _str );
  return array;
};
