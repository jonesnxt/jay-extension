function currentNxtTime()
{
	return Math.floor(Date.now() / 1000) - 1385294400;
}

function nxtTimeBytes()
{
	return converters.int32ToBytes(currentNxtTime());
}

function positiveByteArray(byteArray)
{
	return converters.hexStringToByteArray(converters.byteArrayToHexString(byteArray));
}

function wordBytes(word)
{
	return [(word%256), Math.floor(word/256)];
}

function bytesWord(bytes)
{
	return bytes[1]*256+bytes[0];
}

var _hash = {
		init: SHA256_init,
		update: SHA256_write,
		getBytes: SHA256_finalize
	};

function byteArrayToBigInteger(byteArray, startIndex) {
		var value = new BigInteger("0", 10);
		var temp1, temp2;
		for (var i = byteArray.length - 1; i >= 0; i--) {
			temp1 = value.multiply(new BigInteger("256", 10));
			temp2 = temp1.add(new BigInteger(byteArray[i].toString(10), 10));
			value = temp2;
		}

		return value;
	}

function simpleHash(message) {
		_hash.init();
		_hash.update(message);
		return _hash.getBytes();
	}


	 function getPublicKey(secretPhrase) {
		
			var secretPhraseBytes = converters.stringToByteArray(secretPhrase);
			var digest = simpleHash(secretPhraseBytes);
			return curve25519.keygen(digest).p;
	}


	 function getAccountIdFromPublicKey(publicKey, RSFormat) {
		var hex = converters.hexStringToByteArray(publicKey);

		_hash.init();
		_hash.update(hex);

		var account = _hash.getBytes();

		account = converters.byteArrayToHexString(account);

		var slice = (converters.hexStringToByteArray(account)).slice(0, 8);

		var accountId = byteArrayToBigInteger(slice).toString();

		if (RSFormat) {
			var address = new NxtAddress();

			if (address.set(accountId)) {
				return address.toString();
			} else {
				return "";
			}
		} else {
			return accountId;
		}
	}

	function areByteArraysEqual(bytes1, bytes2) {
		if (bytes1.length !== bytes2.length)
			return false;

		for (var i = 0; i < bytes1.length; ++i) {
			if (bytes1[i] !== bytes2[i])
				return false;
		}

		return true;
	}

	
	 function verifyBytes(signature, message, publicKey) {
		var signatureBytes = signature;
		var messageBytes = message;
		var publicKeyBytes = publicKey;
		var v = signatureBytes.slice(0, 32);
		var h = signatureBytes.slice(32);
		var y = curve25519.verify(v, h, publicKeyBytes);

		var m = simpleHash(messageBytes);

		_hash.init();
		_hash.update(m);
		_hash.update(y);
		var h2 = _hash.getBytes();

		return areByteArraysEqual(h, h2);
	}

	 function signBytes(message, secretPhrase) {
		var messageBytes = message;
		var secretPhraseBytes = converters.stringToByteArray(secretPhrase);

		var digest = simpleHash(secretPhraseBytes);
		var s = curve25519.keygen(digest).s;

		var m = simpleHash(messageBytes);

		_hash.init();
		_hash.update(m);
		_hash.update(s);
		var x = _hash.getBytes();

		var y = curve25519.keygen(x).p;

		_hash.init();
		_hash.update(m);
		_hash.update(y);
		var h = _hash.getBytes();

		var v = curve25519.sign(h, x, s);

		return (v.concat(h));
	}

	function toByteArray(long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

function toIntVal(byteArray) {
    // we want to represent the input as a 8-bytes array
    var intval = 0;

    for ( var index = 0; index < byteArray.length; index ++ ) {
    	var byt = byteArray[index] & 0xFF;
    	var value = byt * Math.pow(256, index);
    	intval += value;
    }

    return intval;
};

function generateToken(websiteString, secretPhrase)
{
		//alert(converters.stringToHexString(websiteString));
		var hexwebsite = converters.stringToHexString(websiteString);
        var website = converters.hexStringToByteArray(hexwebsite);
        var data = [];
        data = website.concat(getPublicKey(secretPhrase));
        var unix = Math.round(+new Date()/1000);
        var timestamp = unix-epochNum;
        var timestamparray = toByteArray(timestamp);
        data = data.concat(timestamparray);

        var token = [];
        token = getPublicKey(secretPhrase).concat(timestamparray);

        var sig = signBytes(data, secretPhrase);

        token = token.concat(sig);
        var buf = "";

        for (var ptr = 0; ptr < 100; ptr += 5) {

        	var nbr = [];
        	nbr[0] = token[ptr] & 0xFF;
        	nbr[1] = token[ptr+1] & 0xFF;
        	nbr[2] = token[ptr+2] & 0xFF;
        	nbr[3] = token[ptr+3] & 0xFF;
        	nbr[4] = token[ptr+4] & 0xFF;
        	var number = byteArrayToBigInteger(nbr);

            if (number < 32) {
                buf+="0000000";
            } else if (number < 1024) {
                buf+="000000";
            } else if (number < 32768) {
                buf+="00000";
            } else if (number < 1048576) {
                buf+="0000";
            } else if (number < 33554432) {
                buf+="000";
            } else if (number < 1073741824) {
                buf+="00";
            } else if (number < 34359738368) {
                buf+="0";
            }
            buf +=number.toString(32);

        }
        return buf;

    }

function parseToken(tokenString, website)
{
 		var websiteBytes = converters.stringToByteArray(website);
        var tokenBytes = [];
        var i = 0;
        var j = 0;

        for (; i < tokenString.length; i += 8, j += 5) {

        	var number = new BigInteger(tokenString.substring(i, i+8), 32);
            var part = converters.hexStringToByteArray(number.toRadix(16));

            tokenBytes[j] = part[4];
            tokenBytes[j + 1] = part[3];
            tokenBytes[j + 2] = part[2];
            tokenBytes[j + 3] = part[1];
            tokenBytes[j + 4] = part[0];

        }

        if (i != 160) {
            new Error("tokenString parsed to invalid size");
        }
        var publicKey = [];
        publicKey = tokenBytes.slice(0, 32);
        var timebytes = [tokenBytes[32], tokenBytes[33], tokenBytes[34], tokenBytes[35]];

        var timestamp = toIntVal(timebytes);
        var signature = tokenBytes.slice(36, 100);

        var data = websiteBytes.concat(tokenBytes.slice(0, 36));
       	
        var isValid = verifyBytes(signature, data, publicKey);

        var ret = {};
        ret.isValid = isValid;
        ret.timestamp = timestamp;
        ret.publicKey = converters.byteArrayToHexString(publicKey);

        return ret;

}


function pad(length, val) {
    var array = [];
    for (var i = 0; i < length; i++) {
        array[i] = val;
    }
    return array;
}

function timeago(timestamp)
{
	var fromnow =  currentNxtTime() - timestamp;
		
	var days =  Math.floor(fromnow/86400);
	var hours = Math.floor((fromnow%86400)/3600);
	var minutes = Math.floor((fromnow%3600)/60);
	var seconds = Math.floor(fromnow&60);
	var acc = "";
	if(days != 0 && days != 1) acc = days + " days ago";
	else if(days == 1) acc = " 1 day ago";
	else if(hours != 0 && hours != 1) acc = hours + " hours ago";
	else if(hours == 1) acc = "1 hour ago";
	else if(minutes != 0 && minutes != 1) acc = minutes + " minutes ago";
	else if(minutes == 1) acc = "1 minute ago";
	else if(seconds != 0 && seconds != 1) acc = seconds + " seconds ago";
	else if(seconds == 1) acc = "1 second ago";
	else acc = "just now";
		
	return acc;
}

function esc(str)
{
	return str.replace("&", "&amp").replace("<", "&lt").replace(">", "&gt").replace("\"", "&quot").replace("'", "&#x27;").replace("/", "&#x2F");
}


// 48 -> 57
// 65 -> 90
// 97 -> 122

	/**
	 * Encoders and decoders for base-62 formatted data. Uses the alphabet 0..9 a..z
	 * A..Z, e.g. '0' => 0, 'a' => 10, 'A' => 35 and 'Z' => 61.
	 * 
	 */
	 	var BASE62 = new BigInteger("62");

	  function valueForByte(key) {
	  	var p = key;
		if(p >= 48 && p <= 57)
		{
			return p - 48;
		}
		else if(p >= 65 && p <= 90)
		{
			return p - 65 + 10;
		}
		else if(p >= 97 && p <= 122)
		{
			return p - 97 + 10 + 26;
		}
	    new Error("base62 digit not found");
	    return -1;
	  }

	  /**
	   * Convert a base-62 string known to be a number.
	   * 
	   * @param s
	   * @return
	   */
		function base62Decode(s) {
	    return base62DecodeBytes(converters.stringToByteArray(s));
	  }

	  /**
	   * Convert a base-62 string known to be a number.
	   * 
	   * @param s
	   * @return
	   */
	  	function base62DecodeBytes(bytes) {
	    var res = new BigInteger("0");
	    var multiplier = new BigInteger("1");

	    for (var i = bytes.length - 1; i >= 0; i--) {
	      res = res.add(multiplier.multiply(new BigInteger(valueForByte(bytes[i]).toString())));
	      multiplier = multiplier.multiply(BASE62);
	    }
	    var btr = res.toByteArray();
	    return positiveByteArray(btr);
	  }

function rndstr(len)
{
	var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	var ret = "";
	var nums = window.crypto.getRandomValues(new Uint32Array(len));

	for(var a=0;a<len;a++)
	{
		ret += letters[nums[a]%letters.length];
	}
	return ret;
}