var NUM_MODELS=1,SIZE=256,LINE_WIDTH=20,MASK_TYPE=!0,PIXEL_ROUND=4,VIEW_WIDTH=286*(NUM_MODELS+2),VIEW_HEIGHT=400,
editors=[],request_in_progress=!1,last_request_failed=!1,connected=!0,base_url="http://155.69.53.27:9090";

function main(){
  // define the basic information of this application
  var b={name:"celebahq",application:"/pluralistic_demo",colors:{Pluralistic:"#FEFEFE"},clear:"#FEFEFE",
  draw:"#FEFEFE",random_list_file:"/projects/pluralistic/celebA_HQ_test.txt",scale:1}, c=new Editor(b);
  document.getElementById(b.name).appendChild(c.view.ctx.canvas);
  editors.push(c);
  init()
}

function render_frame(){
  for(var b=0;b<editors.length;b++)
    editors[b].render()
}

function Editor(b){
  var c=this;
  this.config=b;
  // test code
  this.generate_url=base_url+this.config.application;
  this.view=new View(this.config.name,VIEW_WIDTH,VIEW_HEIGHT);
  this.buffers=[];
  this.raw_buffers=[];
  this.img_masks=[];
  this.buffer_raw=createContext(SIZE,SIZE,1);
  this.img_mask=createContext(SIZE,SIZE,1);
  this.buffer=createContext(SIZE,SIZE,1);
  this.outputs=[];
  for(i=0;i<NUM_MODELS;i++){
    this.output=createContext(SIZE,SIZE,1),this.outputs.push(this.output);
  }
  // build a new XMLHttpRequest examplege
  var d=new XMLHttpRequest;
  this.current_index=0;
  // http connect
  //console.log(base_url+this.config.random_list_file);
  d.open("GET",base_url+this.config.random_list_file,!0);
  d.responseType="text";
  d.onreadystatechange=function(){
    // if connect sucessful, build the temp files
    if(4==d.readyState){
      if(200==d.status){
        c.fileContentLines=d.responseText.split("\n");
        var img=new Image;
        img.crossOrigin="Anonymous";
        img.src=base_url+c.fileContentLines[0];
        img.onload=function(){
          // change image size to fixed 256*256*3
          if (img.width > SIZE || img.height > SIZE){
            img.width = SIZE;
            img.height = SIZE;
          }
          console.log(img.src); //output file paths
          // draw input image
          c.buffer.clearRect(0,0,c.buffer.canvas.width,c.buffer.canvas.height);
          c.buffer.canvas.width=img.width-img.width%PIXEL_ROUND;
          c.buffer.canvas.height=img.height-img.height%PIXEL_ROUND;
          c.buffer.drawImage(img,0,0,SIZE,SIZE);
          // draw mask buffer
          c.img_mask.canvas.width=c.buffer.canvas.width;
          c.img_mask.canvas.height=c.buffer.canvas.height;
          c.img_mask.clearRect(0,0,c.buffer.canvas.width,c.buffer.canvas.height);
          // draw original raw image
          c.buffer_raw.clearRect(0,0,c.buffer.canvas.width,c.buffer.canvas.height);
          c.buffer_raw.canvas.width=img.width-img.width%PIXEL_ROUND;
          c.buffer_raw.canvas.height=img.height-img.height%PIXEL_ROUND;
          c.buffer_raw.drawImage(img,0,0,SIZE,SIZE);
          // draw ouput buffer
          c.outputs[0].clearRect(0,0,c.buffer.canvas.width,c.buffer.canvas.height);
          c.outputs[0].canvas.width=img.width-img.width%PIXEL_ROUND;
          c.outputs[0].canvas.height=img.height-img.height%PIXEL_ROUND;
          update()
        }
      }
      else{
        connected=!1
        }
      }
    };
    d.send()
}

Editor.prototype={
  push_buffer:function(){
    this.buffers.push(this.buffer);
    var b=createContext(this.buffer.canvas.width,this.buffer.canvas.height,this.config.scale);
    b.save();
    b.drawImage(this.buffer.canvas,0,0);
    b.restore();
    this.buffer=b;

    this.raw_buffers.push(this.buffer_raw);
    b=createContext(this.buffer.canvas.width,this.buffer.canvas.height,this.config.scale);
    b.save();
    b.drawImage(this.buffer_raw.canvas,0,0);
    b.restore();
    this.buffer_raw=b;

    this.img_masks.push(this.img_mask);
    b=createContext(this.buffer.canvas.width,this.buffer.canvas.height,this.config.scale);
    b.save();
    b.drawImage(this.img_mask.canvas,0,0);
    b.restore();
    this.img_mask=b
  },
  pop_buffer:function(){
    0!=this.buffers.length&&(this.buffer=this.buffers.pop(),this.buffer_raw=this.raw_buffers.pop(),this.img_mask=this.img_masks.pop())
  },
  render:function(){
    var b=this,c=this.view;
    c.ctx.clearRect(0,0,c.f.width,c.f.height);
    c.ctx.save();
    c.ctx.restore();
    // connected or not
    connected||c.frame("server_error",0,250,c.f.width,50,function(){c.ctx.font="20px Arial";c.ctx.fillStyle="red";c.center_text("Cannot connect to server. Please try again later.")});

      c.frame("raw",35+1*(this.buffer_raw.canvas.width+10),90,this.buffer_raw.canvas.width+20,this.buffer_raw.canvas.height+20,function(){
        // draw original image on the canvas
        c.ctx.drawImage(b.buffer_raw.canvas,0,0)
      });
      for(i=0;i<NUM_MODELS;i++)
        c.frame("output"+i.toString(),50+(i+2)*(this.outputs[i].canvas.width+10),90,this.outputs[i].canvas.width+20,this.outputs[i].canvas.height+20,function(){
          // draw output image on the canvas
          c.ctx.drawImage(b.outputs[i].canvas,0,0)});
          c.frame("Input",120,60,150,50,function(){
            c.ctx.font="bold 12pt Arial";
            c.ctx.fillText("Input",5,15)
          });
          c.frame("Raw",110+1*(35+this.buffer.canvas.width),60,150,50,function(){
            c.ctx.font="bold 12pt Arial";
            c.ctx.fillText("Original",5,15)}
          );
          c.frame("Outputs",80+2*(25+this.buffer.canvas.width),60,150,50,function(){
            c.ctx.font="bold 12pt Arial";
            c.ctx.fillText("Pluralistic Result",5,15)
          });
          c.frame("input",20,90,800,800,function(){
            c.frame("image",0,0,b.buffer.canvas.width,b.buffer.canvas.height,function(){
              // draw input image on the canvas
              c.ctx.drawImage(b.buffer.canvas,0,0,c.f.width,c.f.height);
              c.contains(mouse_pos)&&(cursor_style="crosshair","#FFFFFF"==b.config.draw&&(cursor_style="url(/eraser.png) 8 8, auto"));
              // draw mask region
              if(c.contains(drag_start)&&"#FEFEFE"==b.config.draw){
                if(MASK_TYPE==!0){
                    //draw the line
                    startPoint = c.relative(drag_start);
                    var  endPoint= c.relative(mouse_pos);
                    if (mouse_down && mouse_moving){
                      // draw the line to the buffer and image mask
                      b.buffer.last_pointX = endPoint.x;
                      b.buffer.last_pointY = endPoint.y;
                      b.push_buffer();
                      b.buffer.fillStyle="#FFFFFF";
                      b.buffer.strokeStyle="#FFFFFF";
                      b.buffer.lineWidth=LINE_WIDTH;
                      b.buffer.lineCap="round";
                      b.buffer.lineJoin="round";
                      b.buffer.beginPath();
                      b.buffer.moveTo(b.buffer.last_pointX, b.buffer.last_pointY);
                      b.buffer.lineTo(endPoint.x, endPoint.y);
                      b.buffer.closePath();
                      b.buffer.stroke();
                      b.img_mask.fillStyle="#FFFFFF";
                      b.img_mask.strokeStyle="#FFFFFF";
                      b.img_mask.lineWidth=LINE_WIDTH;
                      b.img_mask.lineCap="round";
                      b.img_mask.lineJoin="round";
                      b.img_mask.beginPath();
                      b.img_mask.moveTo(b.buffer.last_pointX, b.buffer.last_pointY);
                      b.img_mask.lineTo(endPoint.x, endPoint.y);
                      b.img_mask.closePath();
                      b.img_mask.stroke();
                      update()
                    }
                    else {
                      update()
                    }
                }
                else if(MASK_TYPE==0){
                  // draw the rectangle
                  e=c.relative(drag_start);
                  var g=c.relative(mouse_pos);
                  d=Math.min(g.x-e.x,200);
                  g=Math.min(g.y-e.y,200);
                  if(mouse_down){
                    c.ctx.save();
                    c.ctx.restore();
                    c.ctx.rect(0,0,c.f.width,c.f.height);
                    c.ctx.clip();
                    c.ctx.fillStyle=b.config.draw;
                    c.ctx.strokeStyle=b.config.draw;
                    c.ctx.setLineDash([5,3]);
                    var h=parseInt(e.x,10)+.5,k=parseInt(e.y,10)+.5,l=h+parseInt(d,10),m=k+parseInt(g,10);
                    c.ctx.moveTo(h,k);
                    c.ctx.lineTo(l,k);
                    c.ctx.lineTo(l,m);
                    c.ctx.lineTo(h,m);
                    c.ctx.lineTo(h,k);
                    c.ctx.stroke();
                    b.buffer.rect_width=d;
                    b.buffer.rect_height=g;
                    b.img_mask.rect_width=d;
                    b.img_mask.rect_height=g;
                    update()}
                  else
                  {
                    mouse_released&&(
                      b.push_buffer(),
                      b.buffer.fillStyle="#FFFFFF",
                      b.buffer.strokeStyle="#FFFFFF",
                      b.buffer.moveTo(h,k),
                      b.buffer.lineTo(l,k),
                      b.buffer.lineTo(l,m),
                      b.buffer.lineTo(h,m),
                      b.buffer.lineTo(h,k),
                      b.buffer.stroke(),
                      b.buffer.fillRect(parseInt(e.x,10)+.5,parseInt(e.y,10)+.5,parseInt(d,10),parseInt(g,10)),
                      b.buffer.strokeRect(parseInt(e.x,10)+.5,parseInt(e.y,10)+.5,parseInt(d,10),parseInt(g,10)),
                      b.buffer.rect_width=d,
                      b.buffer.rect_height=g,
                      b.img_mask.fillStyle="#FFFFFF",
                      b.img_mask.strokeStyle="#FFFFFF",
                      b.img_mask.fillRect(parseInt(e.x/b.config.scale,10)+.5,parseInt(e.y/b.config.scale,10)+.5,parseInt(d/b.config.scale,10),parseInt(g/b.config.scale,10)),
                      b.img_mask.strokeRect(parseInt(e.x/b.config.scale,10)+.5,parseInt(e.y/b.config.scale,10)+.5,parseInt(d/b.config.scale,10),parseInt(g/b.config.scale,10)),
                      b.img_mask.rect_width=d,
                      b.img_mask.rect_height=g,
                      update())
                  }
                }
              }
            })
          });
                 var d=60;
                 c.frame("mask_button", d, 10, 100, 40, function(){
                    if (do_button(c, "Mask Type:")){
                        MASK_TYPE = !MASK_TYPE;
                        console.log(MASK_TYPE);
                    }
                 });
                 c.frame("mask_type",d+100,10,120,40,function(){
                   c.ctx.font="bold 14pt Arial";
                   c.ctx.strokeRect(d-50,0,120,40)
                   if (MASK_TYPE == !0){
                     c.ctx.fillText("Free-Form",20,20)
                    }
                    else {
                      c.ctx.fillText("Rectangle",20,20)
                    }
                 });
                 d+=180;
                 c.frame("random_button",d+60,10,120,40,function(){
                   if(do_button(c,"Random")){
                     b.push_buffer();
                     var img=new Image;
                     img.crossOrigin="Anonymous";
                     img.src=base_url+b.fileContentLines[Math.floor(Math.random()*b.fileContentLines.length)];
                     img.onload=function(){
                       // change image size to fixed 256*256*3
                       if (img.width > SIZE || img.height > SIZE){
                         img.width = SIZE;
                         img.height = SIZE;
                       }
                       b.buffer.clearRect(0,0,b.buffer.canvas.width,b.buffer.canvas.height);
                       b.buffer.canvas.width=img.width-img.width%PIXEL_ROUND;
                       b.buffer.canvas.height=img.height-img.height%PIXEL_ROUND;
                       b.buffer.drawImage(img,0,0,SIZE,SIZE);
                       b.buffer_raw.clearRect(0,0,b.buffer.canvas.width,b.buffer.canvas.height);
                       b.buffer_raw.canvas.width=img.width-img.width%PIXEL_ROUND;
                       b.buffer_raw.canvas.height=img.height-img.height%PIXEL_ROUND;
                       b.buffer_raw.drawImage(img,0,0,SIZE,SIZE);
                       b.img_mask.canvas.width=b.buffer.canvas.width;
                       b.img_mask.canvas.height=b.buffer.canvas.height;
                       b.img_mask.clearRect(0,0,b.buffer.canvas.width,b.buffer.canvas.height);
                       for(i=0;i<NUM_MODELS;i++)
                          b.outputs[i].clearRect(0,0,b.buffer.canvas.width,b.buffer.canvas.height),
                          b.outputs[i].canvas.width=img.width-img.width%PIXEL_ROUND,
                          b.outputs[i].canvas.height=img.height-img.height%PIXEL_ROUND;
                          update()
                      };
                      update()
                    }
                  });
                  d+=140;
                  c.frame("undo_button",d+60,10,120,40,function(){
                    do_button(c,"Erasure")&&(b.pop_buffer(),update())
                  });
                  d+=140;
                  c.frame("save_button",d+60,10,120,40,function(){
                    if(do_button(c,"Save")){
                      var b=createContext(VIEW_WIDTH,VIEW_HEIGHT,1);
                      b.drawImage(c.ctx.canvas,0,0,VIEW_WIDTH,VIEW_HEIGHT,0,0,b.canvas.width,b.canvas.height);
                      b.font="18px Arial";
                      b.fillText("Fill with Pluralistic",620,40);
                      b.beginPath();
                      b.moveTo(680,45);
                      b.lineTo(800,45);
                      b.stroke();
                      data_b64=b.canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/,"");
                      data=b64_to_bin(data_b64);
                      blob=new Blob([data],{type:"application/octet-stream"});
                      url=window.URL.createObjectURL(blob);
                      a=document.createElement("a");
                      a.href=url;
                      a.download="inpainting_results.png";
                      b=document.createEvent("MouseEvents");
                      b.initEvent("click",!0,!0);
                      a.dispatchEvent(b)
                    }
                    update()
                  });
                  d+=140
                  c.frame("process_button",d+60,10,120,40,function(){
                    if(request_in_progress)
                      do_button(c,"...");
                    else if(do_button(c,"Fill")&&!request_in_progress){
                      last_request_failed=!1;
                      // create new canvas for completion code
                      var W=b.buffer_raw.canvas.width,H=b.buffer_raw.canvas.height,g=createContext(3*W,H,1);
                      // 00 cut position, WH, cut W*H, 00, canvas position
                      g.drawImage(b.buffer_raw.canvas,0,0,W,H,0,0,W,H);
                      g.drawImage(b.img_mask.canvas,0,0,W,H,W,0,W,H);
                      // canvas to image
                      e=g.canvas.toDataURL("image/png",1).replace(/^data:image\/png;base64,/,"");
                      var h=new XMLHttpRequest;
                      h.open("POST",b.generate_url,!0);
                      h.responseType="arraybuffer";
                      h.timeout=45E3;
                      h.onreadystatechange=function(){
                        if(4==h.readyState){
                          if(request_in_progress=!1,update(),200==h.status){
                            // create a uint8 array
                            var c=new Uint8Array(h.response);
                            c=bin_to_b64(c);
                            var img=new Image;
                            img.src="data:image/png;base64,"+c;
                            img.onload=function(){
                              for(i=0;i<NUM_MODELS;i++){
                                var W=img.width/NUM_MODELS,H=img.height;
                                b.outputs[i].fillStyle=b.config.clear;
                                b.outputs[i].fillRect(0,0,b.config.scale*W,b.config.scale*H);
                                b.outputs[i].canvas.width=b.config.scale*W;
                                b.outputs[i].canvas.height=b.config.scale*H;
                                b.outputs[i].scale(b.config.scale,b.config.scale);
                                b.outputs[i].drawImage(img,i*W,0,W,H,0,0,W,H)
                              } // for
                            update()
                            }
                          }
                          else
                            0==h.status&&console.log("Your XMLHttpRequest status is returned with 0, which means the problem/error is not yet defined. Please try another browser or another computer."),last_request_failed=!0
                        } // h.readyState
                     };
                     request_in_progress=!0;
                     update();
                     h.send(b64_to_bin(e))
                   }
                 });
                 last_request_failed&&c.frame("server_error",0,250,c.f.width,50,function(){
                   c.ctx.font="20px Arial";
                   c.ctx.fillStyle="red";
                   c.center_text("Server crowded. Please try again later.")
                 })
               }
             };
             function DBP(b,c,d,e){
               return Math.sqrt((d-b)*(d-b)+(e-c)*(e-c))
             }
             function getAngle(b,c){
               return Math.atan(c/(0==b?.01:b))+(0>b?3.14:0)
             }
             function drawLineNoAliasing(b,c,d,e,f,g){
               var h=DBP(c,d,e,f);
               e=getAngle(e-c,f-d);
               for(f=0;f<h;f++)
                  b.fillRect(parseInt(c+Math.cos(e)*f,10)+.5,parseInt(d+Math.sin(e)*f,10)+.5,g,g);
               for(f=0;f<h;f++)
                  b.strokeRect(parseInt(c+Math.cos(e)*f,10)+.5,parseInt(d+Math.sin(e)*f,10)+.5,g,g)
             }
             // create new canvas
             function createContext(w,h,n){
               var temp=document.createElement("canvas");
               temp.width=w*n;
               temp.height=h*n;
               stylize(temp,{border:"none","user-select":"none","-webkit-user-select":"none","-moz-user-select":"none","-ms-user-select":"none","-ms-touch-action":"none"});
               canv=temp.getContext("2d");
               canv.scale(n,n);
               canv.rect_height=0;
               canv.rect_width=0;
               return canv
             }
             // decoder base64 to string
             function b64_to_bin(b){
               b=atob(b);
               for(var c=new Uint8Array(b.length),d=0;d<b.length;d++)
                  c[d]=b.charCodeAt(d);
               return c
             }
             // encoder bin to base64
             function bin_to_b64(b){
               for(var c=[],d=0;d<b.length;d++)
                  c.push(String.fromCharCode(b[d]));
               b=c.join("");
               return btoa(b)
             }
             var updated=!0,frame_rate=0,now=new Date,last_frame=new Date,animations={},values={},cursor_style=null,mouse_pos=[0,0],last_mouse_pos=[0,0],drag_start=[0,0],no_touching=!0,mouse_down=!1,mouse_pressed=!1,mouse_released=!1;
             function View(b,c,d){
               this.ctx=createContext(c,d,1);
               this.ctx.textBaseline="middle";
               this.frames=[{name:b,offset_x:0,offset_y:0,width:c,height:d}];
               this.f=this.frames[0]
             }

View.prototype={
  push_frame:function(b,c,d,e,f){
    this.ctx.save();
    this.ctx.translate(c,d);
    var g=this.frames[this.frames.length-1];
    b={name:b,offset_x:g.offset_x+c,offset_y:g.offset_y+d,width:e,height:f};
    this.frames.push(b);
    this.f=b
  },
  pop_frame:function(){
    this.ctx.restore();
    this.frames.pop();
    this.f=this.frames[this.frames.length-1]
  },
  frame:function(b,c,d,e,f,g){
    this.push_frame(b,c,d,e,f);
    g();
    this.pop_frame()
  },
  frame_path:function(){
    for(var b=[],c=0;c<this.frames.length;c++)
      b.push(this.frames[c].name);
      return b.join(".")
  },
  relative:function(b){
    var c=this.ctx.canvas.getBoundingClientRect();
    return{x:b.x-c.left-this.f.offset_x,y:b.y-c.top-this.f.offset_y}
  },
  contains:function(b){
    var c=this.ctx.canvas.getBoundingClientRect();
    if(b.x<c.left||b.x>c.left+c.width||b.y<c.top||b.y>c.top+c.height)
      return!1;b=this.relative(b);
    return 0<b.x&&b.x<this.f.width&&0<b.y&&b.y<this.f.height
  },
  put_image_data:function(b,c,d){
    this.ctx.putImageData(b,1*(c+this.f.offset_x),1*(d+this.f.offset_y))
  },
  center_text:function(b){
    this.ctx.fillText(b,(this.f.width-this.ctx.measureText(b).width)/2,this.f.height/2)
  }
};

function do_button(b,c){
  name=b.frame_path();
  b.contains(mouse_pos)&&(cursor_style="pointer");
  request_in_progress?animate(name,parse_color("#aaaaaaFF"),100):mouse_down&&b.contains(mouse_pos)?"save"!=c&&animate(name,parse_color("#FF0000FF"),50):"Fill"==c?no_touching&&b.contains(mouse_pos)?animate(name,parse_color("#ffccccFF"),100):animate(name,parse_color("#ff0000FF"),100):no_touching&&b.contains(mouse_pos)?animate(name,parse_color("#99EEEEFF"),100):animate(name,parse_color("#00AAAAFF"),100);
  b.ctx.save();
  b.ctx.beginPath();
  b.ctx.moveTo(5,0);
  for(var d=[b.f.width,b.f.height,b.f.width,b.f.height],e=0;e<d.length;e++){
    var f=d[e];
    b.ctx.lineTo(f-5,0);
    b.ctx.arcTo(f,0,f,5,5);
    b.ctx.translate(f,0);
    b.ctx.rotate(.5*Math.PI)
  }
  b.ctx.fillStyle=rgba(calculate(name));
  b.ctx.fill();
  b.ctx.restore();
  b.ctx.font="18px Arial";
  b.ctx.fillStyle="#f8f8f8";
  b.center_text(c);
  return request_in_progress?!1:mouse_released&&b.contains(mouse_pos)&&b.contains(drag_start)
}

function stylize(b,c){
  for(var d in c)
    b.style[d]=c[d]
  }

function update(){
  updated=!0
}

function frame(){
  var b=window.requestAnimationFrame(frame);
  if(updated||0!=Object.keys(animations).length){
    now=new Date;
    cursor_style=null;
    updated=!1;
    try{
      render_frame();
    }
    catch(c){
      throw window.cancelAnimationFrame(b),c;
    }
    document.body.style.cursor=null==cursor_style?"default":cursor_style;
    last_frame=now;
    last_mouse_pos=mouse_pos;
    mouse_released=mouse_pressed=!1
  }
}

function array_equal(b,c){
  if(b.length!=c.length)
    return!1;
    for(var d=0;d<b.length;d++)
      if(b[d]!=c[d])
        return!1;
      return!0
}

function animate(b,c,d){
  if(void 0==values[b])
    values[b]=c;
  else{
    var e=calculate(b);
    if(!array_equal(e,c))if(0==d)
      delete animations[b],values[b]=c;
      else{
        var f=animations[b];
        void 0!=f&&array_equal(f.end,c)||(animations[b]={time:now,start:e,end:c,duration:d})
      }
  }
}

function calculate(b){
  if(void 0==values[b])
    throw"calculate used before calling animate";
  var c=animations[b];
  if(void 0!=c){
    var d=Math.min((now-c.time)/c.duration,1);
    d=d*d*d*(d*(6*d-15)+10);
    for(var e=[],f=0;f<c.start.length;f++)
    e[f]=c.start[f]+(c.end[f]-c.start[f])*d;
    1==d&&delete animations[b];
    values[b]=e
  }
  return values[b]
}

function rgba(b){
  return fmt("rgba(%d, %d, %d, %f)",255*b[0],255*b[1],255*b[2],b[3])
}

// calculate the color from the string
var parse_color=function(b){
  return[parseInt(b.substr(1,2),16)/255,parseInt(b.substr(3,2),16)/255,parseInt(b.substr(5,2),16)/255,parseInt(b.substr(7,2),16)/255]
};

// get main pages file
document.getElementById("pluralistic").addEventListener("mousemove",function(b){
  no_touching=!0;
  mouse_pos={
    x:b.clientX,
    y:b.clientY
  };
  mouse_moving=no_touching=!0;
  update()
});

document.getElementById("pluralistic").addEventListener("mousedown",function(b){
  drag_start={
    x:b.clientX,
    y:b.clientY
  };
  mouse_pressed=mouse_down=no_touching=!0;
  update()
});

document.getElementById("pluralistic").addEventListener("mouseup",function(b){
  no_touching=!0;
  mouse_down=!1;
  mouse_released=!0;
  update()
});

document.getElementById("body").addEventListener("mouseup",function(b){
  no_touching=!0;
  mouse_down=!1;
  mouse_released=!0;
  update()
});

document.getElementById("lwidth").onchange= function(){
  LINE_WIDTH = this.value;
}

function default_format(b){
  return"string"===typeof b?b:JSON.stringify(b)
}

function fmt(){
  if(0===arguments.length)
    return"error";
  for(var b=arguments[0],c="",d=1,e=0;e<b.length;){
    var f=b[e];
    e++;
    if("%"!=f)c+=f;else{if(e===b.length){
      c+="%!(NOVERB)";
      break
    }
    var g=b[e];
    e++;
    f=" ";
    "0"==g?f="0":e--;
    for(g=0;"0"<=b[e]&&"9">=b[e];)
      g*=10,g+=parseInt(b[e],10),e++;
    var h=b[e];
    e++;
    if("%"===h)
      c+="%";
    else if(d===arguments.length)
      c+="%!"+h+"(MISSING)";
    else{
      var k=arguments[d];
      d++;
      var l=null;
      "v"===h?l=default_format(k):"s"===h&&"string"===typeof k?l=k:"T"===h?l=typeof k:"d"===h&&"number"===typeof k?l=k.toFixed(0):"f"===h&&"number"===typeof k?l=k.toString():"x"===h&&"number"===typeof k?l=Math.round(k).toString(16):"t"===h&&"boolean"===typeof k?l=k?"true":"false":c+="%!"+h+"("+typeof k+"="+default_format(k)+")";null!==l&&(l.length<g&&(c+=Array(g-l.length+1).join(f)),c+=l)}}}if(d<arguments.length){for(c+="%!(EXTRA ";d<arguments.length;)k=arguments[d],c+=typeof k+"="+default_format(k),d<arguments.length-1&&(c+=", "),d++;c+=")"}
      return c
}

// load the main framework
window.onload=main;

function init(){
  window.requestAnimationFrame(frame)
};
