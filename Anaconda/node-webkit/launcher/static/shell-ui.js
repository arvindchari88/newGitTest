var gui = window.nodeRequire('nw.gui');
var DEBUG = gui.App.argv.indexOf("--debug") > -1;
var win = gui.Window.get();

var menu = new gui.Menu();

menu.append(new gui.MenuItem({
    label: 'Reload',
    click: function() {
        gui.Window.get().reload();
    }
}));
menu.append(new gui.MenuItem({
    label: 'Launcher Info',
    click: function() {
        $('#launcher_version').click();
    }
}));

if (DEBUG) {
    menu.append(new gui.MenuItem({ type: 'separator' }));

    var mouseX = 0;
    var mouseY = 0;
    menu.append(new gui.MenuItem({
        label: 'Show Developer Tools',
        click: function() {
            // Open DevTools in browser if possible - node-webkit's doesn't
            // allow right-click for some reason
            var port = null;
            gui.App.fullArgv.forEach(function(argument) {
                var match = argument.match(/--remote-debugging-port=([0-9]+)/);
                if (match) {
                    port = match[1];
                }
            });

            if (port != null) {
                console.log('opening external devtools');
                gui.Shell.openExternal('http://localhost:' + port);
            }
            else {
                console.log('opening internal devtools');
                gui.Window.get().showDevTools();
            }
        }
    }));
    menu.append(new gui.MenuItem({
        label: 'Log This Element',
        click: function() {
            // Node-webkit doesn't expose inspectElement API. This is a
            // workaround - it will log the element in the console. Right
            // click and hit 'Reveal Element.'

            console.dirxml(document.elementFromPoint(mouseX, mouseY));
        }
    }));

    var fs = nodeRequire('fs');
    var reload = function() {
        window.location.reload();
    };
    ['./static/', './index.html'].forEach(function(file) {
        fs.watch(file, reload);
    });
}

var platform = window.nodeRequire('os').platform();
window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    mouseX = e.x;
    mouseY = e.y;
    menu.popup(mouseX, mouseY);
}, false);


if (!DEBUG) {
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', function(e) {
        if (typeof window.ga !== "undefined" &&
            typeof window.localStorage['analytics'] !== "undefined" &&
            window.localStorage['analytics']) {
            window.ga('send', 'exception', {
                'exDescription': e.stack,
                'exFatal': true
            });
        }
        window.alert("Sorry, the application encountered a fatal error. Please report the following to us at https://github.com/ContinuumIO/anaconda-issues.\n\n" + e.stack);
        if (window.confirm("Click OK to restart Launcher.")) {
            window.location.reload();
        }
        else {
            process.exit(1);
        }
    });
}
