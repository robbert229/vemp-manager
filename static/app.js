xtag.register('bs-alert', {
    content: function(){
        /*
            <div id="alert" class="alert alert-dismissible" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <span id="warning">
                    <strong>Warning!</strong> Better check yourself, you're not looking too good.
                </span>
            </div>
        */
    },
    accessors: {
        message: {
            attribute: {},
            get: function(){

            },
            set: function(value){
                $(this).find("#warning").text(value);
            }
        },
        type: {
            attribute:{},
            get:function(){

            },
            set: function(value){
                switch(value){
                    case "success":
                    $(this).find("#alert").addClass("alert-success");
                    break;
                    case "info":
                    $(this).find("#alert").addClass("alert-info");
                    break;
                    case "warning":
                    $(this).find("#alert").addClass("alert-warning");
                    break;
                    default:
                    $(this).find("#alert").addClass("alert-danger");
                    break;
                }
            }
        }
    }
});


xtag.register('nginx-status', {
    content: function(){
        /*
            <h2 class="centered">Nginx Server Status</h2>
            <div class="well" id="status">
                Not Loaded Yet...
            </div>
            <button class="btn btn-default" type="submit" id="start">Start</button>
            <button class="btn btn-default" type="submit" id="stop">Stop</button>
            <button class="btn btn-default" type="submit" id="reload">Reload</button>     

            <div id="alerts">
                
            </div>       
        */
    },
    lifecycle: {
        created: function(){
            this.start();

            var element = this;

            $(this).find("#start").click(function(){
                console.log("Start!");
                $.get("nginx/start", function(result){
                    result = JSON.parse(result);
                    console.log(result);
                    if(result.Success === false){
                        element.log("danger", result.Error);
                    } else {
                        element.log("success", "Successfully started nginx");
                    }
                })
            });

            $(this).find("#stop").click(function(){
                $.get("nginx/stop", function(result){
                    result = JSON.parse(result);
                    if(result.Success === false){
                        element.log("danger", result.Error);
                    } else {
                        element.log("success","Successfully stopped ngnix");
                    }
                });
            });

            $(this).find("#reload").click(function(){
                $.get("nginx/reload");
            });
        }
    },
    methods: {
        start: function(){
            this.update();
            this.xtag.interval = setInterval(this.update.bind(this), 1000);
        },
        stop: function(){
            this.xtag.interval = clearInterval(this.xtag.interval);
        },
        update: function(){
            var element = this;
            $.get("nginx/status", function(result){
                result = JSON.parse(result);
                $(element).find("#status").text(element.format(result.IsRunning));
            });
        },
        format: function(isRunning){
            return "Is Alive : " + isRunning;
        },
        log: function(type, alertMessage){
            $('<bs-alert/>', {
                message: alertMessage,
                type: type
            }).appendTo($(this).find("#alerts"));
        }
    }
});

xtag.register('nginx-virtual-hosts', {
    content:function(){
        /*
            <h2 class="centered">Virtual Hosts</h2>
            <div class="list-group virtual-hosts">
                <a href="#" class="list-group-item active">
                    Cras justo odio
                </a>
                <a href="#" class="list-group-item">Dapibus ac facilisis in</a>
                <a href="#" class="list-group-item">Morbi leo risus</a>
                <a href="#" class="list-group-item">Porta ac consectetur ac</a>
                <a href="#" class="list-group-item">Vestibulum at eros</a>
            </div>
            <button class="btn btn-default" type="submit">New</button>
            <button class="btn btn-default" type="submit">Delete</button>
        */
    }
});


xtag.register('nginx-modify-virtual-host', {
    content:function(){
        /*
            <form>
                <div class="form-group">
                    <label for="serverName">Virtual Server Name</label>
                    <input type="text" class="form-control" id="serverName" placeholder="Server">
                </div>
                <div class="form-group">
                    <label for="serverHost">Host</label>
                    <input type="text" class="form-control" id="serverHost" placeholder="dev.foo.com">
                </div>
                <div class="form-group">
                    <label for="serverRoot">Host</label>
                    <input type="text" class="form-control" id="serverRoot" placeholder="/var/www/foo.com/">
                </div>

                <div class="form-group">
                    <label for="inputEmail3" class="control-label">Config</label>
                    <textarea class="form-control" rows="20"></textarea>  
                </div>

                <div class="form-group">
                    <button class="btn btn-default" type="submit">Save</button>
                    <button class="btn btn-default" type="submit">Reload</button>
                    <button class="btn btn-default" type="submit">Generate</button>
                    
                </div>
            </form>
        */
    }
})

$(document).ready(function(){

});