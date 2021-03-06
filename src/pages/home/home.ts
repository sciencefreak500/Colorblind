import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';

declare var ntc;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

	@ViewChild('imgCaptured') imgCaptured:any;
	@ViewChild('myCanvas') canvasRef:any;
	@ViewChild('magnifyGlass') glassRef:any;


	img:any;
	canvas:any;
	glass:any;

	rgba:any;
	zoom:any = 2;
	w:any;
	h:any;
	bw:any;
  base64Image:any;
  hexval:any;
  colorName:any;

  constructor(public navCtrl: NavController, public camera: Camera,
   public storage: Storage, public toastCtrl: ToastController, public alertCtrl: AlertController) {
  	
  }

  ionViewDidLoad(){
    //var n_match  = ntc.name("#6195ED");
    //console.log("n_match",n_match);
  	//this.initCanvas();
  	//this.initGlass();
    this.rgba = {r:251,g:164,b:35,a:255};
    this.rgb2hex();
    // this.base64Image = true;   //disable this for device version
    //this.saveColor();
    
  }

  initGlass(){
  	this.glass = this.glassRef.nativeElement;
  	this.img.parentElement.insertBefore(this.glass, this.img);
	  /*set background properties for the magnifier glass:*/
	  this.glass.style.backgroundImage = "url('" + this.img.src + "')";
	  this.glass.style.backgroundRepeat = "no-repeat";
	  this.glass.style.backgroundSize = (this.img.width * this.zoom) + "px " + (this.img.height * this.zoom) + "px";
	  this.bw = 3;
	  this.w = this.glass.offsetWidth / 2;
	  this.h = this.glass.offsetHeight / 2;
	  
  }

  initCanvas(){
  	this.img = this.imgCaptured.nativeElement;
  	this.img.crossOrigin = "Anonymous";


  	this.canvas = this.canvasRef.nativeElement;
  	this.canvas.width = this.img.width;
  	this.canvas.height = this.img.height;
  	this.canvas.getContext('2d').drawImage(this.img,0,0,this.img.width, this.img.height);
  }


  onTouch(event){
    console.log("I TRIGGERED!");
    this.initCanvas();
    this.initGlass();
    this.getPixel(event);
  }

  onMove(event){
    console.log("IM MOVING NOW");
    this.getPixel(event);
  }

  saveColor(){
    //save the color at hand
    var colorArray = [];
    this.storage.get('colorArray').then((val) => {
      colorArray = (val) ? val : [];
      console.log("colorArray",colorArray);
      colorArray.push({
        name: this.colorName,
        rgba: this.rgba,
        hex: this.hexval
      });
      this.storage.set('colorArray', colorArray);
      console.log("done saving color");
      let toast = this.toastCtrl.create({
        message: 'Color Saved',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
  });

  }

  goToSavedColors(){
    this.navCtrl.push('SavedColorsPage');
  }


  getPixel(event){
  	function getCursorPos(e,img) {
    var a, x = 0, y = 0;
    //e = e || window.event;
    /*get the x and y positions of the image:*/
    a = img.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.touches[0].pageX - a.left;
    y = e.touches[0].pageY - a.top;
    /*consider any page scrolling:*/
    ////x = x - window.pageXOffset;
    ////y = y - window.pageYOffset;
    return {x : x, y : y};
  }
  console.log("event",event);
    var absx = event.touches[0].clientX;
    var absy = event.touches[0].clientY;
  	var relative = {
  		x: absx - event.target.x -48,
  		y: absy - event.target.y -48
  	}
    console.log("absx",absx);
    console.log("absy",absy);
    console.log("relative",relative);

    var pixArray = [];
    for (var i = 0; i < 6; ++i) {
      for (var j = 0; j < 6; ++j) {
        pixArray.push(this.canvas.getContext('2d').getImageData(relative.x + i, 
          relative.y + j, 1, 1).data);
      }
    }
    //console.log("pixArray",pixArray);
    var averaged = [];
    var r = 0,g = 0,b = 0;
    for(var ind in pixArray){
      r += pixArray[ind][0];
      g += pixArray[ind][1];
      b += pixArray[ind][2];
    }
    //console.log("r",r);
    //console.log("g",g);
    //console.log("b",b);
    r = Math.round(r/pixArray.length);
    g = Math.round(g/pixArray.length);
    b = Math.round(b/pixArray.length);

  	//var pixelData = this.canvas.getContext('2d').getImageData(relative.x, relative.y, 1, 1).data;
    // this.canvas.getContext('2d').rect(relative.x, relative.y, 18, 18);
    // this.canvas.getContext('2d').fillStyle = "red";
    // this.canvas.getContext('2d').fill();
  	//console.log("pixelData",pixelData);
  	//this.rgba = {r:pixelData[0],g:pixelData[1],b:pixelData[2],a:pixelData[3]};
    this.rgba = {r:r,g:g,b:b,a:255};
    //console.log("this.rgba",this.rgba);

  	//var pos = getCursorPos(event,this.img);
  	var x = relative.x;//pos.x;
  	var y = relative.y;//pos.y;

    this.glass.style.display = "block";

  	/*prevent the magnifier glass from being positioned outside the image:*/
    if (x > this.img.width - (this.w / this.zoom)) {x = this.img.width - (this.w / this.zoom);}
    if (x < this.w / this.zoom) {x = this.w / this.zoom;}
    if (y > this.img.height - (this.h / this.zoom)) {y = this.img.height - (this.h / this.zoom);}
    if (y < this.h / this.zoom) {y = this.h / this.zoom;}
    /*set the position of the magnifier glass:*/
    this.glass.style.left = (x - (this.w - 18)) + "px";
    this.glass.style.top = (y - (this.h - 18)) + "px";
    /*display what the magnifier glass "sees":*/
    this.glass.style.backgroundPosition = "-" + ((x * this.zoom) - this.w + this.bw) + "px -" + ((y * this.zoom) - this.h + this.bw) + "px";
  	
    this.rgb2hex();
  }

  
  rgb2hex(){
    var rgb = 'rgba(' + this.rgba.r + ',' + this.rgba.g + ',' + this.rgba.b +',' + this.rgba.a + ')';
    var rgbres = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
   var result =  (rgbres && rgbres.length === 4) ? "#" +
    ("0" + parseInt(rgbres[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgbres[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgbres[3],10).toString(16)).slice(-2) : '';

    this.hexval = result;
    this.colorName  = ntc.name(result)[1];
    console.log("this.colorName",this.colorName);
  }


  pregetPicture(){
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetHeight: 400,
      targetWidth: 400,
      allowEdit: true,
      correctOrientation: true
    };


    let alert = this.alertCtrl.create({
      title: "Image Source",
      message: "Where would you like your picture to be selected from?",
      buttons: [
        {
          text: "Camera",
          handler: () => {
            options.sourceType = 1;
            this.getPicture(options);
          }
        },

        {
          text: "Album",
          handler: () => {
            options.sourceType = 0;
            this.getPicture(options);
          }
        }
      ]
    });
    alert.present();
  }


   getPicture(options){
    console.log("getting picture");
    this.camera.getPicture(options).then(imageData => {
      this.base64Image = imageData;
    });
  }



}
