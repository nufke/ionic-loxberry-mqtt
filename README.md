# ionic-loxberry-mqtt

**IMPORTANT: This repository is not in active development anymore. Please visit the [LoxBerry PWA](https://github.com/nufke/loxberrypwa) repo for the latest development of the LoxBerry App.**

Early development of a LoxBerry MQTT App.

**NOTE**: The App will not interact with MQTT devices directly. The MQTT API defined for this App enables the control of the App-specific elements using MQTT. To program hardware devices using this app, you need to run an MQTT-to-MQTT topic translator or a program such as Node-RED to translate the App control topics to device-specific MQTT topics.

## Login

The App requires login to a LoxBerry server which is running the [LoxBerry JWT Authentication Server](https://github.com/nufke/loxberry-jwt-auth-server). You can register user acounts via the REST-API of this Authentication Server. After successful login, the App will load the MQTT configuration settings from the LoxBerry server.  

## Setup

The LoxBerry MQTT App will listen to `loxberry/app` topics. All control elements in the App are created and configurated dynamically by means of MQTT topics. More information can be found on the [wiki](https://github.com/nufke/ionic-loxberry-mqtt/wiki). The wiki also contains a simple example to get started. 

# Screenshots

<div>
<img src="screenshots/screenshot_rooms.png" style="width:150px; border: 2px solid #ccc;">
&nbsp;&nbsp;
<img src="screenshots/screenshot_categories.png"  style="width:150px; border: 2px solid #ccc;">
&nbsp;&nbsp;
<img src="screenshots/screenshot_lighting.png" style="width:150px;border: 2px solid #ccc;">
</div>
