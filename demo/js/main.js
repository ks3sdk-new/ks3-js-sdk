(function(){

    var filelistNode = document.getElementById('filelist')
    var ks3Options = {
        KSSAccessKeyId: "8oN7siZgTOSFHft0cXTg",
        policy: "",
        signature: "",
        bucket_name: "yyy",
        key: '${filename}',
        uploadDomain: "http://kssws.ks-cdn.com/yyy",
        autoStart: false,
        onUploadProgressCallBack: function(uploader, obj){
            var itemPerNode = document.getElementById(obj.id);
            itemPerNode.innerHTML = obj.percent + "%";
        },
        onFileUploadedCallBack: function(uploader, obj){
            var itemPerNode = document.getElementById(obj.id);
            itemPerNode.innerHTML = "完成";
        },
        onFilesAddedCallBack: function(uploader, obj){
            var files = uploader.files;
            for (var i = 0; i < files.length; i++){
                var itemNode = document.createElement("li");
                itemNode.innerHTML = files[i].name;
                filelistNode.appendChild(itemNode);
                var itemPerNode = document.createElement("li");
                itemPerNode.id = files[i].id;
                filelistNode.appendChild(itemPerNode);
            }
        }
    };

    var pluploadOptions = {
        drop_element: document.body
    }

    var tempUpload = new ks3FileUploader(ks3Options, pluploadOptions);

    document.getElementById('start-upload').onclick = function (){
    	console.log("start...")
        tempUpload.uploader.start()
    }
})()