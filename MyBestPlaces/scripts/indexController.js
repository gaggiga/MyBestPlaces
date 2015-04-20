var IndexController = (function (navigator, google, window) {
    'use strict';

    function IndexController(mapElement, menuButton, menu)
    {
        this.mapElement = mapElement;
        this.menuButton = menuButton;
        this.menu = menu;
        this.map = {};
        this.pressTimer = {};
        this.currentPosition = { x: 0, y: 0 };
        this.currentLatLng = {};
        this.currentMarker = {};
        this.navOpen = false;

        this.mapElement.addEventListener('mousedown', onMouseDown.bind(this), false);
        this.mapElement.addEventListener('mouseup', onMouseUp.bind(this), false);
        this.menuButton.addEventListener('click', onMenuBtnClick.bind(this), false);

        navigator.geolocation.getCurrentPosition(geolocationSuccess.bind(this));
        var myLoadMenu = loadMenu.bind(this);
        myLoadMenu();
    }

    IndexController.prototype = {
        constructor: IndexController
    }

    return IndexController;

    // Private members
    function geolocationSuccess(position)
    {
        var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            mapOptions = { zoom: 16, center: myLatLng };

        this.map = new google.maps.Map(this.mapElement, mapOptions);
        google.maps.event.addListener(this.map, "mousemove", onMouseMoveOnMap.bind(this));
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(this.menuButton);
        
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: this.map,
            title: 'Tu sei qui!'
        });
        
    }

    function onMouseMoveOnMap(e) {
        this.currentLatLng = e.latLng;
    }

    function onMouseDown(e)
    {
        this.currentPosition = { x: e.clientX, y: e.clientY };
        this.mapElement.addEventListener('mousemove', onMouseMove.bind(this), false);

        this.pressTimer = window.setTimeout(longClick.bind(this), 1500);
        return false;

    }

    function onMouseMove(e)
    {
        if (Math.abs(this.currentPosition.x - e.clientX) + Math.abs(this.currentPosition.y - e.clientY) > 10) {
            clearTimeout(this.pressTimer);
        }
    }

    function longClick()
    {
        this.mapElement.removeEventListener('mousemove', onMouseMove.bind(this), false);

        this.currentMarker = new google.maps.Marker({
            position: this.currentLatLng,
            map: this.map,
            icon: 'images/blueFlag.png'
        });

        navigator.notification.vibrate(500);

        /*
        navigator.notification.prompt(
            'Scegli il nome per questo myBestPlace',
            onPrompt.bind(this),
            'Aggiungi ai myBestPlace',
            ['Salva', 'Annulla'],
            'myBestPlace1');
        */

        var nome = window.prompt('Scegli il nome per questo myBestPlace', 'myBestPlace1');
        var myOnPrompt = onPrompt.bind(this);
        myOnPrompt({ buttonIndex: nome == null ? 2 : 1, input1: nome });
    }

    function onPrompt(results)
    {
        if(results.buttonIndex == 1)
        {
            window.localStorage[results.input1] = JSON.stringify(this.currentLatLng);
            var myLoadMenu = loadMenu.bind(this);
            myLoadMenu();
            humane.log(results.input1 + ' aggiunto ai myBestPlace!');
        } else {
            this.currentMarker.setMap(null);
            this.currentMarker = null;
        }
    }

    function onMouseUp()
    {
        clearTimeout(this.pressTimer);
        this.mapElement.removeEventListener('mousemove', onMouseMove.bind(this), false);
    }

    function onMenuBtnClick()
    {
        this.navOpen = !this.navOpen;
        var body = window.document.getElementsByTagName('body')[0];

        if (this.navOpen) {
            body.classList.add('nav-open');
        } else if (!this.navOpen) {
            body.classList.remove('nav-open');
        }
    }

    function loadMenu()
    {
        this.menu.innerHTML = '';

        for (var i = 0, len = window.localStorage.length; i < len; ++i) {
            var li = window.document.createElement("li"),
            a = window.document.createElement("a");

            a.appendChild(window.document.createTextNode(window.localStorage.key(i)));
            a.classList.add('btn');
            a.classList.add('btn-primary');
            a.classList.add('btn-lg');
            a.classList.add('btn-block');
            li.appendChild(a);
            this.menu.appendChild(li);
        }
    }
})(navigator, google, window);