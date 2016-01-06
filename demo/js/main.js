(function(){

    var filelistNode = document.getElementById('filelist')
    var ks3Options = {
        KSSAccessKeyId: "S1guCl0KF/pEoT6TKTR1",
        policy: "",
        signature: "",
        bucket_name: "bucket4jssdk",
        key: '${filename}',
        acl: "public-read",
        uploadDomain: "http://kssws.ks-cdn.com/bucket4jssdk",
        autoStart: false,
        onUploadProgressCallBack: function(uploader, obj){
            var itemNode = document.getElementById(obj.id);
            var resultNode = itemNode.querySelector('span');
            resultNode.innerHTML = obj.percent + "%";
        },
        onFileUploadedCallBack: function(uploader, obj){ //obj是当前上传的文件对象
            var itemNode = document.getElementById(obj.id);
            var resultNode = itemNode.querySelector('span');
            resultNode.innerHTML = "完成";
            //显示上传的文件的链接
            var linkNode = itemNode.querySelector('a');
            linkNode.href = ks3Options.uploadDomain + "/" + obj.name;
            linkNode.innerHTML = obj.name;
        },
        onFilesAddedCallBack: function(uploader, objArray){ // objArray是等待上传的文件对象的数组
            for (var i = 0 ; i < objArray.length ; i++){
                var itemNode = document.createElement("li");
                itemNode.innerHTML = objArray[i].name + "<span style='margin:5px 20px;'></span><a></a>";;
                itemNode.id = objArray[i].id;
                filelistNode.appendChild(itemNode);
            }
        }
    };

    var pluploadOptions = {
        drop_element: document.body
    }

    var tempUpload = new ks3FileUploader(ks3Options, pluploadOptions);

    document.getElementById('start-upload').onclick = function (){
    	console.log("start...");
        tempUpload.uploader.start();
    }
})();