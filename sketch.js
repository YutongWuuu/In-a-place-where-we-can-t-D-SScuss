//https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
//https://b23.tv/w8hfJXe
let typingSound;
/*function preload() {
  typingSound.src = loadSound('typing.mp3',loaded);
}*/
function setup() {
typingSound = loadSound('typing.mp3');
bombSound = loadSound('bomb.mp3');
graveSound = loadSound('grave.mp3');
}


const canvas = document.getElementById('mycanv');//get the canvas element
  var ctx=canvas.getContext('2d');//get Canvas API drawing context
  /*canvas.style.backgroundColor = '#322A4C';*/

  const grave = new Image();
  grave.src = './grave.png'; 



//initialize MineSweeper variables
var level=[9,9,10]; //row=9,column=9,mine=10
var g_arr=[]; //initialize an empty array : g[x,y] [0,0]to[8,8]
var g_obj={}; //g[x,y]={mark,open}  mark=0-8(how many mines around)/-1(mine) open=0(unopened)/1(opened)/2(suspected)
var g_color={block:'#306461',open:'#bbb',mine:'#333',highlight:'#A0427D'}//define colors of each block's status
var sensitiveWord=['死','妈','屌','鸡','猪','滚','狗','屎','蛋','逼','尿','畜']
var safeWord = ["人", "的", "女", "不", "是", "我", "你", "就", "有", "了", "这", "子", "一", "男", "在", "都", "要", "自", "权", "儿", "个", "大", "会", "出", "没", "说", "生", "也", "性", "到", "为", "家", "长", "己", "能", "去", "来", "美", "孩", "别", "样", "所", "以", "么", "老", "们", "她", "好", "种", "跟", "讲", "上", "用", "白", "欲", "里", "那", "爱", "认", "其", "只", "而", "天", "等", "哈", "外", "黄", "法", "因", "真", "正"];
var mine=['💣', '*' ]
let count = 0;
var mine_arr = [];
let highlightedBlocks = [];


for(let i=0;i<level[0];i++){
  for(let j=0;j<level[1];j++){
    let xy=j+'-'+i
    g_arr.push(xy)//get the coordinates of each obj in the array
    g_obj[xy]={mark:0,open:0}//initialize obj
    drawBlock(xy,g_color.block)
  }
}

//draw blocks
function drawBlock(xy,c){
  let w=50,r=8,m=2; //width,radius,margin
  let n
  let [x,y]=xy.split('-').map(n=>n*w);//the actual coordinates of each block(*50)
  ctx.save();
  ctx.shadowColor = 'rgba(255, 234, 101, 0.5)'; // Shadow color
    ctx.shadowBlur = 3;                    // Shadow blur radius
    ctx.shadowOffsetX = 3;                  // Horizontal distance of shadow
    ctx.shadowOffsetY = 3;                  // Vertical distance of shadow
  ctx.beginPath();
  ctx.moveTo(x,y+r);//draw the blocks(4 arcs)
  ctx.arcTo(x,y+w-m,x+w-m,y+w-m,r);
  ctx.arcTo(x+w-m,y+w-m,x+w-m,y,r);
  ctx.arcTo(x+w-m,y,x,y,r);
  ctx.arcTo(x,y,x,y+w-m,r);
  ctx.fillStyle=c;
  ctx.fill();
  ctx.strokeStyle = '#A0427D';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}



setMine()
//random setMine
  /*CONSOLE   g_arr.sort()      //normal sort: small to big
  g_arr.sort(()=>Math.random()-0.5)      //random sort
  g_arr.sort(()=>Math.random()-0.5).slice(0,10)    //random sort+select the first 10 as mines
  g_obj    //see the marks*/
function setMine(){
  let mine_arr=g_arr.sort(() => Math.random() - 0.5).slice(0,level[2]);
  /*const shuffledArr = [...g_arr].sort(() => Math.random() - 0.5); // Shuffle g_arr
  const mine_arr = shuffledArr.slice(0, level[2]); // Select mines*/
  mine_arr.forEach(n=>{
    g_obj[n].mark=-1//mine mark=-1
    let around=getAround(n)
    around.forEach(xy=>{
      if(g_obj[xy].mark!=-1)//not change the mark of a mine
      g_obj[xy].mark++})//if there is a mine, around's mark ++
  })
}

//select mine's around blocks
  /*CONSOLE  getAround('5-5')*/
function getAround(xy){
  let [x,y]=xy.split('-').map(n=>n*1)//map(n=>n*1):turn xy into a number
  let around=[];
  for(let i=-1;i<=1;i++){//i=-1/0/1 row
    for(let j=-1;j<=1;j++){//j=-1/0/1 colum
      let id=`${x+j}-${y+i}`;
      if(g_arr.includes(id)&&id!=xy)around.push(id);//to determine if id(around blocks) is included in g_arr(all blocks),if true, put them into around[]    except xy itself
    }
  }
  return around
}



//showInfo() //display the numbers to check
//display marks
function showInfo(){
  g_arr.forEach(n=>{
    if (g_obj[n].mark==-1){
      drawBlock(n,g_color.mine)
    }else{
      markText(n,g_obj[n].mark)
    }
  })
}



//display text
function markText(xy,txt){
  let [x,y]=xy.split('-').map(n=>n*50);
  ctx.save();
  ctx.font='30px Baskerville'
  ctx.fillStyle='#306461'
  //ctx.fillStyle = safeWord ? '#306461' : '#fff';
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.fillText(txt,x+25,y+25);
  ctx.restore();
}

// display 汉字
function mark汉字(xy, txt) {
  let [x, y] = xy.split('-').map(n => n * 50);
  ctx.save();
  ctx.font = '30px Baskerville';
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(txt, x + 25, y + 25);
  ctx.restore();
}




//mouse events:click/contextmenu
  /*CONSOLE  console.log(ev)   //catch the mouse move on the canva*/
canvas.addEventListener('click',openBlock)
canvas.addEventListener('contextmenu',markMine)
canvas.addEventListener('contextmenu',addGrave)

function openBlock(ev){
  let x=~~(ev.offsetX/50);
  let y=~~(ev.offsetY/50);
  if(x>8 || y>8)  return  ;//make sure the mouse is on the blocks area
  let xy=x+'-'+y;//find out which block the mouse is on
  //openBlock:update data, update page
  g_obj.open=1;//click=>change the data in g_obj.open
  drawBlock(xy,g_color.open);//redraw the blocks
    let random汉字 = Math.floor(Math.random() * safeWord.length);
    let randomsafeWord = safeWord[random汉字];
    mark汉字(xy, randomsafeWord);
  markText(xy,g_obj[xy].mark);
  //End the game when click the mine
  /*if (g_obj[xy].mark==0){
    openZero(xy)
  }else*/ if(g_obj[xy].mark==-1){
    drawBlock(xy,g_color.mine);
    markText(xy,mine[0]);
    //mark sensitiveWord on 💣
    let randomIndex = Math.floor(Math.random() * sensitiveWord.length);
    let randomsensitiveWord = sensitiveWord[randomIndex];
    mark汉字(xy, randomsensitiveWord);
    bombSound.play();
    setTimeout(() => {
      alert('GAME OVER: Your account has been banned because of frequent use of sensitive words.')
    },3000);
    setTimeout(() => {
      location.reload();
    },3000);
  }
}


//openZero:Recursive display zero
/*function openZero(xy){
  let around=getAround(xy);
  around.forEach(n=>{
    if(g_obj[n].open==0){
      g_obj[n].open=1//force open around
      //update
      drawBlock(n,g_color.open);
        let random汉字 = Math.floor(Math.random() * safeWord.length);
        let randomsafeWord = safeWord[random汉字];
        mark汉字(xy, randomsafeWord);
        markText(n,g_obj[n].mark);
      if(g_obj[n].mark==0)openZero(n)
      }
    })
}*/

//markMine: for unopen blocks, suspect mine=-1, unmark=0
function markMine(ev){
  ev.preventDefault();//prevent the menu of contextmenu
  let x=~~(ev.offsetX/50);
  let y=~~(ev.offsetY/50);
  let xy=x+'-'+y;
  //update
  if(g_obj[xy].open==1)return;//if the block has already opened, you can't mark
  if(g_obj[xy].open==0){
    g_obj[xy].open=-1;
    drawBlock(xy,g_color.mine)
    mark汉字(xy,mine[1])
    count++//count how many mines are marked
    if(count==level[2])checkOver();//to check if all the mines are marked
  }else if (g_obj[xy].open==-1){
    g_obj[xy].open=0;
    drawBlock(xy,g_color.block)
    count--//cancel the count
  }
}

function addGrave(ev){
  ev.preventDefault();
   // Get random position within the canvas
   const x = Math.random() * (canvas.width - grave.width);
   const y = Math.random() * (canvas.height - grave.height);
   // Draw the image at the random position
   grave.onload = function() {
   ctx.drawImage(grave, x, y);
   };
   // If the image is already loaded, draw immediately
   if (grave.complete) {
    ctx.drawImage(grave, x, y);
    graveSound.play();
    }
}

//checkover: to end the game and alert winning
function checkOver(){
  let win=mine_arr.every(n=>g_obj[n].mark == g_obj[n].open===-1);
  setTimeout(()=>{
    alert(win?'WIN: You have successfully avoided all the sensitive words, but are your sentences still what you want them to be?' : "GAME OVER: You don't have so much time to think.")
  },1000);
  setTimeout(() => {
    location.reload();
  },1000);
}

//assist highlighting: mousedown highlight, mouseup cancel
canvas.addEventListener('mousedown',highLight)
canvas.addEventListener('mouseup',unHighLight)

function highLight(ev){
  if (ev.buttons !== 1) return;
  let x=~~(ev.offsetX/50);
  let y=~~(ev.offsetY/50);
  if (x > 8 || y > 8) return;
  let xy=x+'-'+y;
  if(g_obj[xy].open=1){//for unopened or marked block, no highlight
    getAround(xy).forEach(n => {
      if(g_obj[n].open==0){ //only for around blocks that are unopened
      drawBlock(n,g_color.highlight);
      highlightedBlocks.push(n);
    }
  })
}
}

function unHighLight() {
  highlightedBlocks.forEach(n => {
  if (g_obj[n].open == 0) { // Only unhighlight blocks that are still unopened
    drawBlock(n, g_color.block);
    }
  });
  highlightedBlocks = []; // Clear the array of highlighted blocks
}

/*canvas.addEventListener('click',playTypingSound);
function playTypingSound() {
  // Play the sound only if it's loaded
  if (typingSound && typingSound.isLoaded()) {
    typingSound.play();
  } else {
    console.error('Sound file not loaded yet.');
  }
}*/

function mousePressed() {
  if (typingSound.isPlaying()) {
    // .isPlaying() returns a boolean
    typingSound.stop();
  } else {
    typingSound.play();
  }
}
