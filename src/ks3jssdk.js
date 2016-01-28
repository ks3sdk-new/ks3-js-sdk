(function KS3JsSDK (win) {
    var ks3FileUploader = function(ks3PostOptions, pluploadOptions){
        this.defaultKS3Options  = {
            KSSAccessKeyId: "",
            policy: "", //请求中用于描述获准行为的安全策略。没有安全策略的请求被认为是匿名请求，只能访问公共可写空间。
            signature: "", //根据Access Key Secret和policy计算的签名信息，KS3验证该签名信息从而验证该Post请求的合法性。
            bucket_name: "", //上传的空间名
            key: "", //被上传键值的名称。如果用户想要使用文件名作为键值，可以使用${filename} 变量。例如：如果用户想要上传文件local.jpg，需要指明specify /user/betty/${filename}，那么键值就会为/user/betty/local.jpg。
            acl: "private", //上传文件访问权限,有效值: private | public-read | public-read-write | authenticated-read | bucket-owner-read | bucket-owner-full-control
            uploadDomain: "", //上传域名,http://destination-bucket.kss.ksyun.com 或者 http://kssws.ks-cdn.com/destination-bucket
            autoStart: false, //是否在文件添加完毕后自动上传
            onInitCallBack: function(){}, //上传初始化时调用的回调函数
            onErrorCallBack: function(){}, //发生错误时调用的回调函数
            onFilesAddedCallBack: function(){}, //文件添加到浏览器时调用的回调函数
            onBeforeUploadCallBack: function(){}, //文件上传之前时调用的回调函数
            onStartUploadFileCallBack: function(){}, //文件开始上传时调用的回调函数
            onUploadProgressCallBack: function(){}, //上传进度时调用的回调函数
            onFileUploadedCallBack: function(){}, //文件上传完成时调用的回调函数
            onUploadCompleteCallBack: function(){} //所有上传完成时调用的回调函数
        };
        if (ks3PostOptions){
            //用ks3PostOptions覆盖 defaultKS3Options
            plupload.extend(this.defaultKS3Options, ks3PostOptions);
        }

        var multipartParams = {};

        if (this.defaultKS3Options.signature&&this.defaultKS3Options.policy){
            multipartParams = {
                "key": this.defaultKS3Options.key,
                "acl": this.defaultKS3Options.acl,
                "signature" : this.defaultKS3Options.signature,
                "KSSAccessKeyId": this.defaultKS3Options.KSSAccessKeyId,
                "policy": this.defaultKS3Options.policy
            }
        } else {
            multipartParams = {
                "key": this.defaultKS3Options.key,
                "acl": this.defaultKS3Options.acl,
                "KSSAccessKeyId": this.defaultKS3Options.KSSAccessKeyId
            }            
        }

        this.defaultPluploadOptions = {
            runtimes : 'html5,flash,silverlight,html4', //上传模式，依次退化;
            url: this.defaultKS3Options.uploadDomain || "http://kssws.ks-cdn.com/destination-bucket", 
            browse_button: 'browse', //触发对话框的DOM元素自身或者其ID
            flash_swf_url : 'js/Moxie.swf', //Flash组件的相对路径
            silverlight_xap_url : 'js/Moxie.xap', //Silverlight组件的相对路径;
            drop_element: undefined, //触发拖动上传的元素或者其ID
            multipart: true,
            multipart_params: multipartParams
        };

        if (pluploadOptions){
            plupload.extend(this.defaultPluploadOptions, pluploadOptions);
        }

        this.uploader = new plupload.Uploader(this.defaultPluploadOptions);
        this.uploader.bind("Init", this.onInit, this);
        this.uploader.bind("Error", this.onUploadError, this);
        this.uploader.init();

        this.uploader.bind("FilesAdded", this.onFilesAdded, this)
        this.uploader.bind("BeforeUpload", this.onBeforeUpload, this)
        this.uploader.bind("UploadFile", this.onStartUploadFile, this)
        this.uploader.bind("UploadProgress", this.onUploadProgress, this)
        this.uploader.bind("FileUploaded", this.onFileUploaded, this)
    };

    ks3FileUploader.prototype.onInit = function(uploader, obj){
        this.defaultKS3Options.onInitCallBack&&
        this.defaultKS3Options.onInitCallBack.apply(this, [uploader, obj]);
    };

    ks3FileUploader.prototype.onUploadError = function(uploader, obj) {
        this.defaultKS3Options.onErrorCallBack&&
        this.defaultKS3Options.onErrorCallBack.apply(this, [uploader, obj]);
    };

    ks3FileUploader.prototype.onFilesAdded = function(uploader, obj) {
        if (this.defaultKS3Options.autoStart)
            this.uploader.start();
        this.defaultKS3Options.onFilesAddedCallBack&&
        this.defaultKS3Options.onFilesAddedCallBack.apply(this, [uploader, obj]);
    };

    ks3FileUploader.prototype.onBeforeUpload = function(uploader, obj) {
        this.defaultKS3Options.onBeforeUploadCallBack&&
        this.defaultKS3Options.onBeforeUploadCallBack.apply(this, [uploader, obj]);
    };

    ks3FileUploader.prototype.onStartUploadFile = function(uploader, obj) {
        this.defaultKS3Options.onStartUploadFileCallBack&&
        this.defaultKS3Options.onStartUploadFileCallBack.apply(this, [uploader, obj]);
    };

    ks3FileUploader.prototype.onUploadProgress = function(uploader, obj) {
        this.defaultKS3Options.onUploadProgressCallBack&&
        this.defaultKS3Options.onUploadProgressCallBack.apply(this, [uploader, obj]);
    };

    ks3FileUploader.prototype.onFileUploaded = function(uploader, obj, resObj) {
        this.defaultKS3Options.onFileUploadedCallBack&&
        this.defaultKS3Options.onFileUploadedCallBack.apply(this, [uploader, obj, resObj]);
    };

    ks3FileUploader.prototype.onUploadComplete = function(uploader, obj) {
        this.defaultKS3Options.onUploadCompleteCallBack&&
        this.defaultKS3Options.onUploadCompleteCallBack.apply(this, [uploader, obj]);
    };

    return win.ks3FileUploader = ks3FileUploader;
})(window);

//create namespace
var Ks3 = {};

/**
 * 给url添加请求参数
 * @param url
 * @param obj
 * @returns {string}  带请求参数的url
 */
Ks3.addURLParam = function(url, obj) {
    url += url.indexOf("?") == -1  ? "?" : "";

    var ret = [];
    for(var key in obj){
        key = encodeURIComponent(key);
        var value = obj[key];
        if(value && Object.prototype.toString.call(value) == '[object String]'){
            ret.push(key + '=' + encodeURIComponent(value));
        }
    }
    return url + ret.join('&');
}

/**
 * Changes XML to JSON  （xml 不带属性）
 * @param xml
 * @returns {{}}  js对象
 */
Ks3.xmlToJson = function (xml) {
    // Create the return object
    var obj = {};
    if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                if( nodeName === '#text'){
                    obj = item.nodeValue;
                }else{
                    obj[nodeName] = Ks3.xmlToJson(item);
                }
            } else {//同级同标签转化为数组
                if (typeof(obj[nodeName].length) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(Ks3.xmlToJson(item));
            }
        }
    }
    return obj;
};




/*基于Javascript的Base64加解密算法*/
Ks3.Base64 = {};

/*Base64编码表*/
Ks3.Base64.encTable =[
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '+', '/'
];

/*Base64解码表*/
Ks3.Base64.decTable =[
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, 62, -1, -1, -1, 63, 52, 53,
    54, 55, 56, 57, 58, 59, 60, 61, -1, -1,
    -1, -1, -1, -1, -1, 00, 01, 02, 03, 04,
    05, 06, 07, 08, 09, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, -1, -1, -1, -1, -1, -1, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
    49, 50, 51, -1, -1, -1, -1, -1
];

/**
 * UTF8编码规则：
 * U+00000000 – U+0000007F   0xxxxxxx
 * U+00000080 – U+000007FF   110xxxxx 10xxxxxx
 * U+00000800 – U+0000FFFF   1110xxxx 10xxxxxx 10xxxxxx
 * U+00010000 – U+001FFFFF   11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
 * U+00200000 – U+03FFFFFF   111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
 * U+04000000 – U+7FFFFFFF   1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
 */

/*将任意字符串按UTF8编码*/
Ks3.Base64.encUTF8 =function(str) {
    var code, res =[], len =str.length;
    var byte1, byte2, byte3, byte4, byte5, byte6;
    for (var i = 0; i < len; i++) {
        //Unicode码：按范围确定字节数
        code = str.charCodeAt(i);

        //单字节ascii字符：U+00000000 – U+0000007F	0xxxxxxx
        if (code > 0x0000 && code <= 0x007F) res.push(code);

        //双字节字符：U+00000080 – U+000007FF	110xxxxx 10xxxxxx
        else if (code >= 0x0080 && code <= 0x07FF) {
            byte1 = 0xC0 | ((code >> 6) & 0x1F);
            byte2 = 0x80 | (code & 0x3F);
            res.push(byte1, byte2);
        }

        //三字节字符：U+00000800 – U+0000FFFF	1110xxxx 10xxxxxx 10xxxxxx
        else if (code >= 0x0800 && code <= 0xFFFF) {
            byte1 = 0xE0 | ((code >> 12) & 0x0F);
            byte2 = 0x80 | ((code >> 6) & 0x3F);
            byte3 = 0x80 | (code & 0x3F);
            res.push(byte1, byte2, byte3);
        }

        //四字节字符：U+00010000 – U+001FFFFF	11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        else if (code >= 0x00010000 && code <= 0x001FFFFF) {
            byte1 =0xF0 | ((code>>18) & 0x07);
            byte2 =0x80 | ((code>>12) & 0x3F);
            byte3 =0x80 | ((code>>6) & 0x3F);
            byte4 =0x80 | (code & 0x3F);
            res.push(byte1, byte2, byte3, byte4);
        }

        //五字节字符：U+00200000 – U+03FFFFFF	111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
            byte1 =0xF0 | ((code>>24) & 0x03);
            byte2 =0xF0 | ((code>>18) & 0x3F);
            byte3 =0x80 | ((code>>12) & 0x3F);
            byte4 =0x80 | ((code>>6) & 0x3F);
            byte5 =0x80 | (code & 0x3F);
            res.push(byte1, byte2, byte3, byte4, byte5);
        }

        //六字节字符：U+04000000 – U+7FFFFFFF	1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        else if (code >= 0x04000000 && code <= 0x7FFFFFFF) {
            byte1 =0xF0 | ((code>>30) & 0x01);
            byte2 =0xF0 | ((code>>24) & 0x3F);
            byte3 =0xF0 | ((code>>18) & 0x3F);
            byte4 =0x80 | ((code>>12) & 0x3F);
            byte5 =0x80 | ((code>>6) & 0x3F);
            byte6 =0x80 | (code & 0x3F);
            res.push(byte1, byte2, byte3, byte4, byte5, byte6);
        }
    }
    return res;
};



/**
 * 将任意字符串用Base64加密
 * str：要加密的字符串
 * utf8编码格式
 */
Ks3.Base64.encode =function(str) {
    if (!str) return '';
    var bytes = Ks3.Base64.encUTF8(str);
    var i = 0, len = bytes.length, res = [];
    var c1, c2, c3;
    while (i < len) {
        c1 = bytes[i++] & 0xFF;
        res.push(Ks3.Base64.encTable[c1 >> 2]);
        //结尾剩一个字节补2个=
        if (i == len) {
            res.push(Ks3.Base64.encTable[(c1 & 0x03) << 4], '==');
            break;
        }

        c2 = bytes[i++];
        //结尾剩两个字节补1个=
        if (i == len) {
            res.push(Ks3.Base64.encTable[((c1 & 0x03) << 4) | ((c2 >> 4) & 0x0F)]);
            res.push(Ks3.Base64.encTable[(c2 & 0x0F) << 2], '=');
            break;
        }

        c3 = bytes[i++];
        res.push(Ks3.Base64.encTable[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
        res.push(Ks3.Base64.encTable[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);
        res.push(Ks3.Base64.encTable[c3 & 0x3F]);
    }
    return res.join('');
};




const chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode  */
const b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
/*
 * //使用hmac_sha1算法计算字符串的签名
 *  return base-64 encoded strings
 */
function b64_hmac_sha1(key, data) {
    return binb2b64(core_hmac_sha1(key, data)) + '=';
}
/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
    var bkey = str2binb(key);
    if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

    var ipad = Array(16), opad = Array(16);
    for(var i = 0; i < 16; i++)
    {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
    return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var str = "";
    for(var i = 0; i < binarray.length * 4; i += 3)
    {
        var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
            | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
            |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
        for(var j = 0; j < 4; j++)
        {
            if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
            else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
    }
    return str;
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for(var i = 0; i < str.length * chrsz; i += chrsz)
        bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
    return bin;
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
    /* append padding */
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;

    var w = Array(80);
    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;
    var e = -1009589776;

    for(var i = 0; i < x.length; i += 16)
    {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;

        for(var j = 0; j < 80; j++)
        {
            if(j < 16) w[j] = x[i + j];
            else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
            var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
        }

        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);

}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
    return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
    if(t < 20) return (b & c) | ((~b) & d);
    if(t < 40) return b ^ c ^ d;
    if(t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
        (t < 60) ? -1894007588 : -899497514;
}


/**
 *  产生headers
 *  CanonicalizedKssHeaders
 */
function generateHeaders(header) {
    var str = '';
    var arr = [];

    if(header){
        var prefix = 'x-kss';
        for(var it in header){
            // step1 : 所有`x-kss`的属性都转换为小写
            if(it.indexOf(prefix) == 0){
                arr.push((it+':'+header[it]).toLowerCase());
            }
        }
        // step2 : 根据属性名排序
        arr.sort();
        // step3 : 拼接起来
        str = arr.join('\n');
    }
    return str;
}

/**
 * 根据SK和请求生成Signature（用于Authorization头部）
 * @param sk      secrete key
 * @param bucket  bucket name
 * @param object   object key
 * @param http_verb  PUT/GET/POST/DELETE
 * @param headers  headers of request
 * @returns {*}
 */
function generateToken(sk, bucket, object, http_verb, headers){
    // Content-MD5, Content-Type, CanonicalizedKssHeaders都为空
    var canonicalized_Kss_Headers = generateHeaders(headers);
    var canonicalized_Resource = '/' + bucket + '/' + object;
    if (headers !== '') {
        var string2Sign = http_verb + '\n' + '' + '\n' + '' + '\n'  + canonicalized_Kss_Headers + '\n' + canonicalized_Resource;
    } else {
        var string2Sign = http_verb + '\n' + '' + '\n' + '' + '\n'  + canonicalized_Resource;
    }
    var signature = b64_hmac_sha1(sk, string2Sign);

    return signature;
}