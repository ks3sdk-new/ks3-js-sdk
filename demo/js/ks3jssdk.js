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
                ,'Cache-Control':this.defaultKS3Options['Cache-Control']
                ,'Expires': this.defaultKS3Options['Expires']
                ,'Content-Disposition': this.defaultKS3Options['Content-Disposition']
                ,'Content-Encoding': this.defaultKS3Options['Content-Encoding']
                ,'Content-Type': this.defaultKS3Options['Content-Type']
                ,'Content-Encoding': this.defaultKS3Options['Content-Encoding']
            }
        } else {
            multipartParams = {
                "key": this.defaultKS3Options.key,
                "acl": this.defaultKS3Options.acl,
                "KSSAccessKeyId": this.defaultKS3Options.KSSAccessKeyId
            }            
        }

        for(var prop in this.defaultKS3Options) {
            if(typeof this.defaultKS3Options[prop] == 'string' && prop.indexOf('x-kss-meta-') !== -1) {
                multipartParams[prop] = this.defaultKS3Options[prop];
            }
        }

        this.defaultPluploadOptions = {
            runtimes : 'html5,flash,silverlight,html4', //上传模式，依次退化;
            url: this.defaultKS3Options.uploadDomain,
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
Ks3.Base64 = {
    encTable :[  /*Base64编码表*/
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
        'w', 'x', 'y', 'z', '0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9', '+', '/'
    ],
    decTable:[ /*Base64解码表*/
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
    ],
    encUTF8: function(str) { /*将任意字符串按UTF8编码*/
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
    },
    encode: function(str) {
        /**
         * 将任意字符串用Base64加密
         * str：要加密的字符串
         * utf8编码格式
         */
        if (!str) return '';
        var bytes = this.encUTF8(str);
        var i = 0, len = bytes.length, res = [];
        var c1, c2, c3;
        while (i < len) {
            c1 = bytes[i++] & 0xFF;
            res.push(this.encTable[c1 >> 2]);
            //结尾剩一个字节补2个=
            if (i == len) {
                res.push(this.encTable[(c1 & 0x03) << 4], '==');
                break;
            }

            c2 = bytes[i++];
            //结尾剩两个字节补1个=
            if (i == len) {
                res.push(this.encTable[((c1 & 0x03) << 4) | ((c2 >> 4) & 0x0F)]);
                res.push(this.encTable[(c2 & 0x0F) << 2], '=');
                break;
            }

            c3 = bytes[i++];
            res.push(this.encTable[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
            res.push(this.encTable[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);
            res.push(this.encTable[c3 & 0x3F]);
        }
        return res.join('');
    }

};


Ks3.chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode  */
Ks3.b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */


/*
 * //使用hmac_sha1算法计算字符串的签名
 *  return base-64 encoded strings
 */
 Ks3.b64_hmac_sha1 = function(key, data) {
    return Ks3.binb2b64(Ks3.core_hmac_sha1(key, data));
}
/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
Ks3.core_hmac_sha1 = function(key, data)
{
    var bkey = Ks3.str2binb(key);
    if(bkey.length > 16) bkey = core_sha1(bkey, key.length * Ks3.chrsz);

    var ipad = Array(16), opad = Array(16);
    for(var i = 0; i < 16; i++)
    {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = Ks3.core_sha1(ipad.concat(Ks3.str2binb(data)), 512 + data.length * Ks3.chrsz);
    return Ks3.core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
Ks3.binb2b64 = function(binarray)
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
            if(i * 8 + j * 6 > binarray.length * 32) str += Ks3.b64pad;
            else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
    }
    return str;
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
Ks3.str2binb = function(str)
{
    var bin = Array();
    var mask = (1 << Ks3.chrsz) - 1;
    for(var i = 0; i < str.length * Ks3.chrsz; i += Ks3.chrsz)
        bin[i>>5] |= (str.charCodeAt(i / Ks3.chrsz) & mask) << (32 - Ks3.chrsz - i%32);
    return bin;
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
Ks3.core_sha1 = function(x, len)
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
            else w[j] = Ks3.rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
            var t = Ks3.safe_add(Ks3.safe_add(Ks3.rol(a, 5), Ks3.sha1_ft(j, b, c, d)),
                Ks3.safe_add(Ks3.safe_add(e, w[j]), Ks3.sha1_kt(j)));
            e = d;
            d = c;
            c = Ks3.rol(b, 30);
            b = a;
            a = t;
        }

        a = Ks3.safe_add(a, olda);
        b = Ks3.safe_add(b, oldb);
        c = Ks3.safe_add(c, oldc);
        d = Ks3.safe_add(d, oldd);
        e = Ks3.safe_add(e, olde);
    }
    return Array(a, b, c, d, e);

}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
Ks3.safe_add =function(x, y)
{
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
Ks3.rol = function(num, cnt)
{
    return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
Ks3.sha1_ft = function(t, b, c, d)
{
    if(t < 20) return (b & c) | ((~b) & d);
    if(t < 40) return b ^ c ^ d;
    if(t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
Ks3.sha1_kt = function(t)
{
    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
        (t < 60) ? -1894007588 : -899497514;
}


/**
 *  产生headers
 *  CanonicalizedKssHeaders
 */
Ks3.generateHeaders =function(header) {
    var str = '';
    var arr = [];

    if(header){
        var prefix = 'x-kss';
        for(var it in header){
            // step1 : 所有`x-kss`的属性都转换为小写
            if(it.indexOf(prefix) == 0){
                arr.push((it.toLowerCase() +':'+header[it]));
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
 * @param resource  ObjectKey[?subResource]
 * @param http_verb  PUT/GET/POST/DELETE
 * @param content_type Content-Type request header
 * @param headers  headers of request
 * @returns {*}
 */
Ks3.generateToken = function (sk, bucket, resource, http_verb, content_type, headers, time_stamp){
    // Content-MD5, Content-Type, CanonicalizedKssHeaders都为空
    var canonicalized_Kss_Headers = Ks3.generateHeaders(headers);
    var canonicalized_Resource = '/' + bucket + '/' + resource;
    if (canonicalized_Kss_Headers !== '') {
        var string2Sign = http_verb + '\n' + '' + '\n' + content_type + '\n'  + time_stamp + '\n' + canonicalized_Kss_Headers + '\n' + canonicalized_Resource;
    } else {
        var string2Sign = http_verb + '\n' + '' + '\n' + content_type + '\n' + time_stamp + '\n' + canonicalized_Resource;
    }
    console.log('string2Sign:' + string2Sign);
    var signature = Ks3.b64_hmac_sha1(sk, string2Sign);
    //console.log('signature:' + signature);
    return signature;
}

/**
 * 获取过期时间戳
 * @param seconds  多少秒后过期
 */
function getExpires(seconds) {
    return Math.round(new Date().getTime()/1000) + seconds;
};

/*
 * url endpoints for different regions
 */
Ks3.ENDPOINT = {
    HANGZHOU : 'kss.ksyun.com',
    AMERICA: 'ks3-us-west-1.ksyun.com',
    BEIJING : 'ks3-cn-beijing.ksyun.com',
    HONGKONG: 'ks3-cn-hk-1.ksyun.com',
    SHANGHAI: 'ks3-cn-shanghai.ksyun.com'
};

Ks3.config = {
    AK: '',
    SK: '',
    protocol:'http',
    baseUrl:'',
    region: '',
    bucket: '',
    prefix:'kss',
    // 分块上传的最小单位
    chunkSize:5*1024*1024,
    // 分块上传重试次数
    retries:20
}

/**
 *  Get Bucket( List Object)  获取bucket下的objects
 * @param bucket  : bucket name
 * @param url     : 如：http://kss.ksyun.com/
 * @param cb  : callback function
 *
 * @param {object} params
 * {
 *     Bucket: '', // 非必传
 *	   delimiter: '', //分隔符，用于对一组参数进行分割的字符。
 *	   'encoding-type': '', //指明请求KS3与KS3响应使用的编码方式。
 *	   maker: '',         //指定列举指定空间中对象的起始位置。KS3按照字母排序方式返回结果，将从给定的 marker 开始返回列表。如果相应内容中IsTruncated为true，则可以使用返回的Contents中的最后一个key作为下次list的marker参数
 *	   'max-keys': 0,  //设置响应体中返回的最大记录数（最后实际返回可能小于该值）。默认为1000。如果你想要的结果在1000条以后，你可以设定 marker 的值来调整起始位置。
 *	   prefix: '',    //限定响应结果列表使用的前缀
 * }
 */
Ks3.listObject = function(params, cb) {
    var xhr = new XMLHttpRequest();
    var listObjectParams = {
        delimiter: params['delimiter'],
        'encoding-type': params['encoding-type'],
        marker: params['marker'],
        'max-keys': params['max-keys'],
        prefix: params['prefix']
    };
    var bucketName = params.Bucket || Ks3.config.bucket;
    var region = params.region || Ks3.config.region;
    if (region ) {
        Ks3.config.baseUrl =  Ks3.ENDPOINT[region];
    }
    var url =  Ks3.config.protocol + '://' + Ks3.config.baseUrl + '/' + bucketName;  //元数据获取不要走cdn
    url = Ks3.addURLParam(url, listObjectParams);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                //xml转为json格式方便js读取
                cb(Ks3.xmlToJson(xhr.responseXML));
            } else {
                alert('Request was unsuccessful: ' + xhr.status);
                console.log('status: ' + xhr.status);
            }
        }
    };
    //在金山云存储控制台(ks3.ksyun.com)中的”空间设置"页面需要设置对应空间(bucket)的CORS配置，允许请求来源(Allow Origin: * )和请求头(Allow Header: * )的GET请求,否则浏览器会报跨域错误
    xhr.open('GET', url, true);
    xhr.send(null);
}

/**
 *  Delete Object
 * @param {object} params
 * {
 *      Bucket: '' not required, bucket name
 *      Key   : ''   Required ,   object key
 *      region : ''   not required  bucket所在region
 * }
 * @param cb  : callback function
 */
Ks3.delObject = function(params, cb) {
    var bucketName = params.Bucket || Ks3.config.bucket;
    var key = encodeURIComponent(params.Key);
    var region = params.region || Ks3.config.region;
    if (region ) {
        Ks3.config.baseUrl =  Ks3.ENDPOINT[region];
    }
    var url = Ks3.config.protocol + '://' + Ks3.config.baseUrl + '/' + bucketName + '/' + key;
    var signature = Ks3.generateToken(Ks3.config.SK, bucketName, key, 'DELETE', '' ,'', '');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                cb(xhr.status);
            }else {
                alert('Request was unsuccessful: ' + xhr.status);
                console.log('status: ' + xhr.status);
            }
        }
    };
    xhr.open("DELETE", url, true);
    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    xhr.send(null);
};


/**
 * key 进行encodeURIComponent编码，'/'不能被编码
 */
Ks3.encodeKey = function (key) {
    if(key == null) {
        return '';
    }
    var newKey = encodeURIComponent(key);
    newKey = newKey.replace(/\+/g,'%20').replace(/\*/g,'%2A').replace(/%7E/g,'~').replace(/%2F/g, '/');
    return newKey;
}

/**
 * 获取指定object的元数据
 * params {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    region : '' not required  bucket所在region
 * }
 */
Ks3.headObject = function(params, cb) {
    if (params.Key === null || params.Key === undefined) {
        alert('require the Key');
    }
    var key = Ks3.encodeKey(params.Key);
    var region = params.region || Ks3.config.region;
    if (region ) {
        Ks3.config.baseUrl =  Ks3.ENDPOINT[region];
    }
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    if(!bucketName) {
        alert('require the bucket name');
    }
    var url = Ks3.config.protocol + '://' + Ks3.config.baseUrl + '/' + bucketName + '/' + key;
    var type = 'HEAD';
    var signature = Ks3.generateToken(Ks3.config.SK, bucketName, key, type, '' ,'', '');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                //前端需要访问的头需要在CORS设置的Exposed Header中显式列出
                cb(null, xhr);
            }else {
                console.log('status: ' + xhr.status);
                cb({"msg":"request failed"}, xhr);
            }
        }
    };
    xhr.open(type, url, true);
    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    xhr.send(null);
}

/**
 * 获取指定object
 * params {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    region : '' not required  bucket所在region
 *    range : ''  not required  for range request
 * }
 */
Ks3.getObject = function(params, cb) {
    if (params.Key === null || params.Key === undefined) {
        alert('require the Key');
    }
    var key = Ks3.encodeKey(params.Key);
    var region = params.region || Ks3.config.region;
    if (region ) {
        Ks3.config.baseUrl =  Ks3.ENDPOINT[region];
    }
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    if(!bucketName) {
        alert('require the bucket name');
    }
    var range = params.range || '';
    var url = Ks3.config.protocol + '://' + Ks3.config.baseUrl + '/' + bucketName + '/' + key;
    var type = 'GET';
    var signature = Ks3.generateToken(Ks3.config.SK, bucketName, key, type, '' ,'', '');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                var bb = new Blob([this.response],{type: this.getResponseHeader('Content-Type')});  //from IE 10
                cb(null, bb, xhr);
            }else {
                console.log('status: ' + xhr.status);
                cb({"msg":"request failed"}, bb, xhr);
            }
        }
    };
    xhr.open(type, url, true);
    xhr.responseType = 'arraybuffer';
    var reRange = /^bytes=(\d+)-(\d+)$/i;
    if(range!==''&& reRange.test(range)){
        xhr.setRequestHeader('Range',range);
    }
    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    xhr.send(null);
}


/**
 * 断点续传下载
 * 文件分片下载进度存储于localStorage（以filePath做关键字索引文件）
 * @param {object} params
 * {
 *      Bucket: '' not required, bucket name
 *      Key   : ''   Required ,   object key
 *      filePath: '' Required,    file path to save
 *      chunk: ''  not required, chunk size by bytes, default is 100 * 1024 B
 * }
 */
Ks3.download = function(params, cb) {
    var bucketName = params.Bucket || Ks3.config.bucket;
    // 这个地方不能进行encode
    var key = params.Key;
    var filePath =  params.filePath || bucketName + '-' + key.replace('/','-') ; //因为浏览器文件系统不能在不存在的目录下直接创建文件，故将目录转为文件名的前缀

    if (!key) {
        alert('require the object Key');
    }

    var ak = Ks3.config.AK;
    var sk = Ks3.config.SK;
    var TEMP_SPACE = 1024 * 1024 * 1024 ; // 1GB


    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    function onError(e) {
        console.log('Error', e);
    }
    // 用户要下载生成的文件
    var downFileName = filePath + '.download';

   var config = null; //配置信息集合
    // 分块大小
    var chunk = params.chunk || 1 * 1024 * 100;
    var count = 0;
    var index = 0;

    async.auto({
            /**
             * 初始化或者读取configFile
             * 1. 获取文件大小
             * 2. 并且根据分块大小计算出总共请求次数
             */
            init: function(callback) {
                /**
                 * 重置记录进度的配置文件，删除下载了部分的重名文件
                 * @param config
                 */
                function resetConfig(conf) {
                    localStorage.setItem(filePath, JSON.stringify(conf));
                    index = 0;

                    //如果有重名文件downFileName，删除
                    window.requestFileSystem(window.TEMPORARY, TEMP_SPACE, function(fs) {
                        fs.root.getFile(downFileName, {create: false}, function(fileEntry) {
                            fileEntry.remove(function() {
                                console.log(downFileName + ' File removed.');
                            }, onError);
                        }, onError);
                    }, onError);
                };


                /**
                 * 从云端获取文件元数据
                 */
                console.log('远程获取元数据');
                Ks3.headObject(params, function(err, res) {
                    if (err) {
                        callback(err);
                    } else {
                        var length = res.getResponseHeader('content-length');
                        count = parseInt(length / chunk) + (length % chunk == 0 ? 0 : 1);
                        if (count == 0) {
                            callback({
                                msg: '文件大小为0'
                            })
                        } else if (localStorage && localStorage[filePath]) { // 之前已经有配置信息了
                            config = JSON.parse(localStorage.getItem(filePath));
                            if (config['lastModifyTime'] == res.getResponseHeader('Last-Modified')) {
                                console.log('本地读取数据');
                                count = config['count'];
                                index = config['index'];
                            } else {
                                config = {
                                    "BUCKET": bucketName,
                                    "KEY": key,
                                    "path": filePath,
                                    "chunk": chunk,
                                    "count": count,
                                    "index": 0,
                                    "lastModifyTime": res.getResponseHeader('Last-Modified')
                                };
                                resetConfig(config);
                            }
                        } else { //无配置信息
                            config = {
                                "BUCKET": bucketName,
                                "KEY": key,
                                "path": filePath,
                                "chunk": chunk,
                                "count": count,
                                "index": 0,
                                "lastModifyTime": res.getResponseHeader('Last-Modified')
                            };
                            resetConfig(config);
                        }
                        callback(null);
                    }
                });
            },
            /**
             * 下载分块数据,并追加到文件末尾
             */
            down: ['init', function(callback, result) {
                // 下载逻辑
                var progressBar = document.getElementById("downloadProgressBar");
                progressBar.max = count;

                function writeToFileSystem(blob, path) {
                    window.requestFileSystem(window.TEMPORARY,  TEMP_SPACE, function(fs) {
                        fs.root.getFile(path, {create: true}, function(fileEntry) {
                            fileEntry.createWriter(function(writer) {
                                var len = writer.length;
                                writer.seek(len); // Start write position at EOF.
                                console.log('download file length: ' + len);
                                writer.write(blob);
                            }, onError);
                        }, onError);
                    }, onError);
                }


                var downHandler = function() {
                    //更新下载进度
                    progressBar.value = index;
                    var percent = index + '/' + count;
                    document.getElementById('downloadPercent').innerText = percent;

                    if (index + 1 > count) { // 下载结束
                        console.log('下载结束')
                        callback(null);
                    } else { // 还没下载完,继续进行下载
                        console.log('进行下载:', index, '/', count);
                        Ks3.getObject({
                                Bucket:bucketName,
                                Key: key,
                                range: 'bytes=' + index * chunk + '-' + ((index + 1) * chunk - 1)
                            },
                            function(err, data, res) {
                                if (err) {
                                    callback(err, data);
                                } else {
                                    writeToFileSystem(data, downFileName);
                                    index = index + 1;
                                    config['index'] = index;
                                    localStorage.setItem(filePath, JSON.stringify(config));
                                    downHandler();
                                }
                            });
                    }
                };
                downHandler();
            }]
        },
        function(err, results) {
            /**
             * 将浏览器文件系统中的文件拷贝到用户文件系统中
             */
            function copyFileInBrowserRootToUserOS(fromFilePath, toFilePath) {
                window.requestFileSystem(window.TEMPORARY, TEMP_SPACE, function(fs) {
                    fs.root.getFile(fromFilePath, {create: false}, function(fileEntry) {
                        fileEntry.file(function(file) {
                            //downloadFile
                            var aLink = document.createElement('a');
                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
                            aLink.download = toFilePath;
                            window.URL = window.URL || window.webkitURL;
                            aLink.href = window.URL.createObjectURL(file);
                            aLink.dispatchEvent(evt);
                        }, onError);
                    }, onError);
                }, onError);
            }

            if (err) {
                if (cb) {
                    cb(err, results)
                } else {
                    localStorage.removeItem(filePath);
                    throw err;
                }
            } else {
                localStorage.removeItem(filePath);

                copyFileInBrowserRootToUserOS(downFileName, filePath);
                if (cb) {
                    cb(err, {msg:'success',path:filePath}, null);
                }
            }
        })
}


/**
 * 下面这些部分都是关于分块上传的
 */
/**
 * 初始化
 *  params {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    region : '' not required  bucket所在region
 *    ContentType: ''  not required  content type of object key
 *    ACL: ''   not required   private | public-read
 * }
 */
Ks3.multitpart_upload_init = function(params, cb) {
    var ak = Ks3.config.AK || '';
    var sk = Ks3.config.SK || '';
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    var Key = Ks3.encodeKey(params.Key) || null;

    if (!bucketName) {
        throw new Error('require the bucketName');
    }

    if (!Key) {
        throw new Error('require the object Key');
    }
    var region = params.region || Ks3.config.region;
    if (region ) {
        Ks3.config.baseUrl =  Ks3.ENDPOINT[region];
    }

    var resource =  Key + '?uploads';
    resource = resource.replace(/\/\//g, "/%2F");

    var contentType = params.ContentType || '';

    var type = 'POST';
    var url = Ks3.config.protocol + '://' + Ks3.config.baseUrl + '/' + bucketName + '/' + resource;
    var xhr = new XMLHttpRequest();
    xhr.open(type, url, true);

    var acl = params.ACL;
    if (acl == 'private' || acl == 'public-read') {
        var attr_Acl = 'x-' + Ks3.config.prefix + '-acl';
        xhr.setRequestHeader(attr_Acl, acl);
        var signature = Ks3.generateToken(Ks3.config.SK, bucketName, resource, type, contentType ,{'x-kss-acl':acl}, '');
    }else{
        var signature = Ks3.generateToken(Ks3.config.SK, bucketName, resource, type, contentType ,'', '');
    }


    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                var uploadId = Ks3.xmlToJson(xhr.responseXML)['InitiateMultipartUploadResult']['UploadId'];
                cb(null, uploadId);
            }else {
                console.log('status: ' + xhr.status);
                cb({"msg":"request failed"}, null);
            }
        }
    };

    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    if(contentType) {
        xhr.setRequestHeader('Content-Type', contentType);
    }

    xhr.send(null);
}

/**
 * 上传分块
 *  params {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    ContentType: ''  not required  content type of object key
 *    PartNumber: ''  Required   分块的序号
 *    UploadId: ''   Required    初始化分块上传时获取的上传id
 *    body:  表示上传内容的blob对象
 * }
 */
Ks3.upload_part = function(params, cb){
    var ak = Ks3.config.AK || '';
    var sk = Ks3.config.SK || '';
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    var Key = Ks3.encodeKey(params.Key) || null;
    var contentType = params.ContentType || '';

    var partNumber = (typeof params.PartNumber!=='undefined') ?params.PartNumber: '';
    var uploadId = params.UploadId || '';


    if (!bucketName || !Key) {
        throw new Error('require the bucketName and object key');
    }

    if (partNumber==='' || !uploadId) {
        throw new Error('require the partNumber and uploadId');
    }
    var body = params.body || '';
    var resource = Key + '?partNumber='+partNumber+'&uploadId='+uploadId;
    resource = resource.replace(/\/\//g, "/%2F");
    var url = Ks3.config.protocol + '://'  + Ks3.config.baseUrl + '/' + bucketName + '/' + resource;
    var type = 'PUT';
    var signature = Ks3.generateToken(Ks3.config.SK, bucketName, resource, type, contentType ,'', '');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                var etag = xhr.getResponseHeader('Etag');
                cb(null, partNumber,etag);
            }else {
                console.log('status: ' + xhr.status);
                cb({"msg":"request failed"}, null);
            }
        }
    };
    xhr.open(type, url, true);
    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    if(contentType) {
        xhr.setRequestHeader('Content-Type', contentType);
    }
    if(body) {
        //var contentLength = body.byteLength;
        //xhr.setRequestHeader('Content-Length', contentLength);
        xhr.send(body);
    }

}

/**
 * 完成上传（发送合并分块命令）
 * @param params
 * {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    UploadId: ''   Required    初始化分块上传时获取的上传id
 *    body: ''  Required   描述的分块列表的xml文档
 * }
 * @param cb
 */
Ks3.upload_complete = function(params,cb){
    var ak = Ks3.config.AK || '';
    var sk = Ks3.config.SK || '';
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    var key = Ks3.encodeKey(params.Key) || null;
    var uploadId = params.UploadId || '';

    if (!bucketName || !key) {
        throw new Error('require the bucketName and object key');
    }

    if (!uploadId) {
        throw new Error('require the uploadId');
    }

    var body = params.body || '';
    var resource =  key + '?uploadId='+uploadId;
    resource = resource.replace(/\/\//g, "/%2F");
    var contentType = 'text/plain;charset=UTF-8';

    var url = Ks3.config.protocol + '://'  + Ks3.config.baseUrl + '/' + bucketName + '/' + resource;
    var type = 'POST';
    var signature = Ks3.generateToken(Ks3.config.SK, bucketName, resource, type, contentType,'', '');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                var res = Ks3.xmlToJson(xhr.responseXML);
                cb(null, res);
            }else {
                console.log('status: ' + xhr.status);
                cb({"msg":"request failed","status": xhr.status}, res);
            }
        }
    };

    xhr.open(type, url, true);
    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    if(body) {
        xhr.send(body);
    }
}

/**
 *
 * @param params
 * {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    UploadId: ''   Required    初始化分块上传时获取的上传id
 * }
 * @param cb
 */
Ks3.upload_list_part = function(params,cb){
    var ak = Ks3.config.AK || '';
    var sk = Ks3.config.SK || '';
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    var key = Ks3.encodeKey(params.Key) || null;
    var uploadId = params.UploadId || '';

    if (!bucketName || !key) {
        throw new Error('require the bucketName and object key');
    }

    if (!uploadId) {
        throw new Error('require the uploadId');
    }

    var resource =  key + '?uploadId='+uploadId;
    resource = resource.replace(/\/\//g, "/%2F");

    var url = Ks3.config.protocol + '://'  + Ks3.config.baseUrl + '/' + bucketName + '/' + resource;
    var type = 'GET';
    var signature = Ks3.generateToken(Ks3.config.SK, bucketName, resource, type, '','', '');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                var res = Ks3.xmlToJson(xhr.responseXML);
                cb(null, res);
            }else {
                console.log('status: ' + xhr.status);
                cb({"msg":"request failed","status": xhr.status}, res);
            }
        }
    };

    xhr.open(type, url, true);
    xhr.setRequestHeader('Authorization','KSS ' + Ks3.config.AK + ':' + signature );
    xhr.send(null);
}




/**
 * 上传文件
 * 根据文件大小,进行简单上传和分块上传
 * @param params
 * {
 *    Bucket: '' not required, bucket name
 *    Key: ''    Required   object key
 *    region : '' not required  bucket所在region
 *    ContentType: ''  not required  content type of object key
 *    ACL: ''   not required   private | public-read
 * }
 * @param cb
 */

Ks3.multipartUpload = function(params, cb) {
    /**
     * 计算用于记录上传任务进度的key
     * @param name
     * @param lastModified
     * @param bucket
     * @param key
     */
    function getProgressKey(name, lastModified, bucket, key) {
        var result = name + "-" + lastModified + "-" + bucket + "-" + key;
        return result;
    }
    var config;
    /**
     * 把配置信息写到配置文件里,作为缓存
     */
    function configInit(file, cb) {
        var fileSize = file.size;
        var count = parseInt(fileSize / Ks3.config.chunkSize) + ((fileSize % Ks3.config.chunkSize == 0 ? 0: 1));

        if (count == 0) {
            cb({
                msg: 'The file is empty.'
            })
        } else {
            config = {
                name: file.name,
                size: fileSize,
                chunkSize: Ks3.config.chunkSize,
                count:count,
                index: 1,
                etags:{},
                retries: 0
            }
            localStorage.setItem(progressKey, JSON.stringify(config));
            if(cb) {
                cb(null);
            }
        }
    }

    /**
     * 获取指定的文件部分内容
     */
    function getFileContent(file, chunkSize, start, cb) {
        var start = start;
        var bufferSize = file.size;
        var index = start / chunkSize;
        console.log('正在读取下一个块的文件内容 index:' + index);
        if (start + chunkSize > bufferSize) {
            chunkSize = bufferSize - start;
        }
        console.log('分块大小:', chunkSize);

        if(file.slice) {
            var blob = file.slice(start, start + Ks3.config.chunkSize);
        }else if(file.webkitSlice) {
            var blob = file.webkitSlice(start, start + Ks3.config.chunkSize);
        }else if(file.mozSlice) {
            var blob = file.mozSlice(start, start + Ks3.config.chunkSize);
        }else{
            throw new Error("blob API doesn't work!");
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            cb(e.target.result);
        };
        reader.readAsArrayBuffer(blob);
    }


    var ak = Ks3.config.AK || '';
    var sk = Ks3.config.SK || '';
    var bucketName = params.Bucket || Ks3.config.bucket || '';
    var key = params.Key || params.File.name;
    key = Ks3.encodeKey(key);
    var region = params.region || Ks3.config.region;
    if (region ) {
        Ks3.config.baseUrl =  Ks3.ENDPOINT[region];
    }
    var file = params.File;
    var progressKey = getProgressKey(file.name, file.lastModified, bucketName, key);
    console.log(progressKey);

    // 会根据文件大小,进行简单上传和分块上传
    var contentType = params.ContentType || '';

    var progressBar = document.getElementById("multipartUploadProgressBar");
    // 分块上传
    async.auto({
            /**
             * 初始化配置文件,如果没有就新建一个
             */
            init: function(callback) {
                if ( !localStorage[progressKey]) {
                    configInit(file, function(err) {
                        callback(err);
                    })
                } else {
                    callback(null);
                }

            },
            show: ['init', function(callback) {
                console.log('  开始上传文件: ' + progressKey)
                config = JSON.parse(localStorage.getItem(progressKey));

                progressBar.max = config['count'];
                progressBar.value = config['index'];
                callback(null);
            }],
            /**
             * 获取uploadId,如果有就直接读取,没有就从服务器获取一个
             */
            getUploadId: ['init', function(callback) {
                config = JSON.parse(localStorage.getItem(progressKey));
                var uploadId = config['uploadId'];

                if ( !! uploadId) {
                    callback(null, uploadId)
                } else {
                    Ks3.multitpart_upload_init(params, function(err, uploadId) {
                        config['uploadId'] = uploadId;
                        localStorage.setItem(progressKey, JSON.stringify(config));
                        callback(null, uploadId)
                    });
                }
            }],
            /**
             * 对文件进行上传
             * 上传后要把信息写到本地存储配置文件中
             * 如果都上传完了,就把相关本地存储信息删除
             * 并通知服务器,合并分块文件
             */
            upload: ['getUploadId', function(callback, result) {
                var uploadId = result.getUploadId;
                config = JSON.parse(localStorage.getItem(progressKey));
                var count = config['count'];
                var index = config['index'];
                var chunkSize = config['chunkSize'];
                var currentRetries = config['retries'];

                // 在报错的时候重试
                function retry(err) {
                    console.log('upload ERROR:', err);
                    if (currentRetries > Ks3.config.retries) {
                        throw err
                    } else {
                        currentRetries = currentRetries + 1;
                        config['retries'] = currentRetries;
                        localStorage.setItem(progressKey, JSON.stringify(config));
                        console.log('第 ' + currentRetries + ' 次重试');
                        up();
                    }
                }
                // 真正往服务端传递数据
                function up() {
                    console.log('正在上传 ', 'index: ' + index);
                    var start = (index - 1) * chunkSize;
                    // 判断是否已经全部都传完了
                    if (index <= count) {
                        getFileContent(file, chunkSize, start, function(body) {
                            delete params.File;
                            params.UploadId = uploadId;
                            params.PartNumber = index;
                            params.body = body;
                            params.type = contentType;
                            console.log('正在上传第 ', index, ' 块,总共: ', + count + ' 块');

                            try {
                                Ks3.upload_part(params, function(err, partNumber, etag) {
                                    if (err) {
                                        retry(err);
                                    } else {
                                        config['index'] = index;
                                        progressBar.value = config['index'];
                                        config['etags'][index] = etag;
                                        localStorage.setItem(progressKey, JSON.stringify(config));
                                        index = index + 1;
                                        up();
                                    }
                                });
                            } catch(e) {
                                retry(e);
                            }
                        })
                    } else {
                        console.log('发送合并请求');
                        delete params.File;
                        params.UploadId = uploadId;
                        params.body = generateCompleteXML(progressKey);

                        Ks3.upload_complete(params, function(err, res) {
                            if (err) throw err;
                            callback(err, res);
                        })
                    }

                    /**
                     * 生成合并分块上传使用的xml
                     */
                    function generateCompleteXML(progressKey) {
                        var content = JSON.parse(localStorage.getItem(progressKey));
                        var index = content.index;
                        var str = '';
                        if (index > 0) {
                            str = '<CompleteMultipartUpload>';
                            for (var i = 1; i <= index; i++) {
                                str += '<Part><PartNumber>' + i + '</PartNumber><ETag>' + content.etags[i] + '</ETag></Part>'
                            }
                            str += '</CompleteMultipartUpload>';
                        }
                        return str;
                    }
                };
                up();
            }]
        },
        function(err, results) {
            if (err) throw err;
            //删除配置
            localStorage.removeItem(progressKey);
            if (cb) {
                cb(err, results);
            }
        });



}