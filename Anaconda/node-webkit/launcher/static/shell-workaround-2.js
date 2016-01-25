window.coffeeRequire = window.require;

window.require = function(module) {
    try {
        return window.coffeeRequire(module);
    }
    catch(e) {
        return window.nodeRequire(module);
    }
};
