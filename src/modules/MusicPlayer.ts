const songData = [
  {
  "song": "Track 1",
  "artist": "Artist 1",
  "album": "Album 1",
  "length": "1:48"
  },
  {
  "song": "Track 2",
  "artist": "Artist 2",
  "album": "Album 2",
  "length": "4:26"
  },
  {
  "song": "Track 3",
  "artist": "Artist 3",
  "album": "Album 3",
  "length": "3:58"
  },
  {
  "song": "Track 4",
  "artist": "Artist 4",
  "album": "Album 4",
  "length": "7:23"
  },
  {
  "song": "Track 5",
  "artist": "Artist 5",
  "album": "Album 5",
  "length": "3:07"
  }
]

// Tracks position in shuffleArray
let shuffleVal = 0

// Used to set audio source position to user's position
export class AudioFollow {
  update() {
    let camPos = Camera.instance.position
    music.getComponent(Transform).position = new Vector3(camPos.x-7.5, camPos.y, camPos.z-2.5)
  }
}

// Used to track how long a song has been playing
let songLen = 10
export class AudioTimer {
  update(dt: number){
    if (music.getComponent(AudioSource).playing){
      if (songLen > 0){
        songLen -= dt
      } else {
        stopButton.visible = true
        stopButton.isPointerBlocker = true
        playButton.visible = false
        playButton.isPointerBlocker = false
        if (loop){
          switchSong(1, "relative")
          switchSong(-1, "relative")
        } else if (shuffle){
          switchSong(shuffleArray[shuffleVal], "absolute")
          if (shuffleVal < songData.length-1){
            shuffleVal++
          } else {
            shuffler(shuffleArray)
            shuffleVal = 0
          }
        } else {
          switchSong(1, "relative")
        }
        updateTitle()
        triggerHighlight()
      }
    }
  }
}

// Used to track current song
let currSong = 0

// Used to store order of shuffled tracks
let shuffleArray = []

// Declares UI variables but doesn't set values yet
let canvas = new UICanvas()
let imageTexture = new Texture("images/buttons.png", {"samplingMode": 1})
let background = new UIImage(canvas, imageTexture)
let playButton = new UIImage(background, imageTexture)
let stopButton = new UIImage(background, imageTexture)
let currSongTitle = new UIText(background)
let currSongDesc = new UIText(background)

// Stores queue text elements
const queueTitleArray = []
const queueDescArray = []
const queuePlayArray = []

// Used to track if shuffle / loop are toggled
let shuffle = 0
let loop = 0

// Shuffles array
function shuffler(array) {
  var currentIndex = array.length, temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  log("Shuffler Result: " + array)
  return array;
}

function shuffleReset() {
  let tempArray = []
  for (let i = 0; i < songData.length; i++){
    if (i != currSong){
      tempArray.push(i)
    }
  }
  return [currSong].concat(shuffler(tempArray))
}

// Refreshes title
function updateTitle(){
  currSongTitle.value = songData[currSong].song.length <= 35 ? songData[currSong].song : songData[currSong].song.substr(0, 35) + "..."
  currSongTitle.hTextAlign = "center"
  currSongTitle.positionX = 0
  currSongTitle.positionY = 120
  currSongTitle.fontSize = 19
  currSongTitle.isPointerBlocker = false

  currSongDesc.value = (songData[currSong].artist + " • " + songData[currSong].album).length <= 35 ? (songData[currSong].artist + " • " + songData[currSong].album): (songData[currSong].artist + " • " + songData[currSong].album).substr(0, 35) + "..."
  currSongDesc.hTextAlign = "center"
  currSongDesc.positionX = 0
  currSongDesc.positionY = 105
  currSongDesc.fontSize = 15
  currSongDesc.color = Color4.Gray()
  currSongDesc.isPointerBlocker = false
}

// Refreshes queue
function updateSongList(){
  for (let i = 0; i < songData.length; i++){
    queueTitleArray[i].value = songData[i].song.length <= 35 ? songData[i].song : songData[i].song.substr(0, 35) + "..."
    queueTitleArray[i].positionX = -85
    queueTitleArray[i].positionY = 25-40*i
    queueTitleArray[i].fontSize = 15
    queueTitleArray[i].isPointerBlocker = false
    queueTitleArray[i].vTextAlign = "top"

    queueDescArray[i].value = (songData[i].artist + " • " + songData[i].album).length <= 35 ? (songData[i].artist + " • " + songData[i].album) : (songData[i].artist + " • " + songData[i].album).substr(0, 35) + "..."
    queueDescArray[i].positionX = -85
    queueDescArray[i].positionY = 10-40*i
    queueDescArray[i].fontSize = 13
    queueDescArray[i].color = Color4.Gray()
    queueDescArray[i].isPointerBlocker = false
    queueDescArray[i].vTextAlign = "top"

    queuePlayArray[i].width = 338
    queuePlayArray[i].height = 40
    queuePlayArray[i].positionY = 36-40*i
    queuePlayArray[i].sourceLeft = 0
    queuePlayArray[i].sourceTop = 319
    queuePlayArray[i].sourceWidth = 338
    queuePlayArray[i].sourceHeight = 40
    queuePlayArray[i].isPointerBlocker = true
    queuePlayArray[i].onClick = new OnClick(() => {
      stopButton.visible = true
      stopButton.isPointerBlocker = true
      playButton.visible = false
      playButton.isPointerBlocker = false
      switchSong(i, "absolute")
      updateTitle()
      triggerHighlight()
      if (shuffle){
        shuffleArray = shuffleReset()
        shuffleVal = 1
      }
    })
  }
}

// Used to toggle queue play button color
function triggerHighlight(){
  for (let i = 0; i < songData.length; i++){
    if (queueTitleArray[i].color != Color3.White()){
      queueTitleArray[i].color = Color3.White()
    }
  }
  queueTitleArray[currSong].color = new Color3(0, 134/255, 244/255)

  for (let j = 0; j < songData.length; j++){
    if (queuePlayArray[j].sourceTop == 273){
      queuePlayArray[j].sourceTop = 319
    }
  }
  queuePlayArray[currSong].sourceTop = 273
}

// Generates an audio source for each song
const music = new Entity()
music.addComponent(new Transform())
let sourceList = []
for (let i = 0; i < songData.length; i++){
  sourceList[i] = new AudioSource(new AudioClip("sounds/song" + i + ".mp3"))
}
music.addComponent(sourceList[currSong])

// Switches audio source based on absolute position in song list or relative to current song
function switchSong(pos: number, type: string){
  music.removeComponent(AudioSource)
  if (type == "relative"){
    currSong = getSongPos(pos)
  } else if (type == "absolute"){
    currSong = pos
  }
  songLen = parseInt(songData[currSong].length.split(":", 2)[0])*60 + parseInt(songData[currSong].length.split(":", 2)[1])
  music.addComponent(sourceList[currSong])
  music.getComponent(AudioSource).playing = true
}

// Returns position of song in sourceList array depending on input
function getSongPos(pos: number){
  if (pos >= 1){
    let temp = currSong
    for (let i = 0; i < pos; i++){
      temp = temp == sourceList.length-1 ? 0 : temp+1;
    }
    return temp
  } else if (pos == -1){
    return currSong == 0 ? sourceList.length-1 : currSong-1;
  }
}

export class MusicPlayer {
  constructor(){
    this.initializeUI()
    engine.addSystem(new AudioFollow)
    engine.addSystem(new AudioTimer)
    updateTitle()
    updateSongList()
    engine.addEntity(music)
  }

  whenDoorOpens(){
    switchSong(1, "relative")
  }

  // Displays UI
  initializeUI(){
    canvas = new UICanvas()
    imageTexture = new Texture("images/buttons.png", {"samplingMode": 1})
    background = new UIImage(canvas, imageTexture)
    playButton = new UIImage(background, imageTexture)
    stopButton = new UIImage(background, imageTexture)
    currSongTitle = new UIText(background)
    currSongDesc = new UIText(background)

    // Height of media buttons
    let mediaHeight = 55

    // Create screenspace component
    background.width = 338
    background.height = 264
    background.positionX = -17
    background.positionY = 17
    background.sourceLeft = 0
    background.sourceTop = 0
    background.sourceWidth = 338
    background.sourceHeight = 264
    background.hAlign = "right"
    background.vAlign = "bottom"

    const scrollableContainer = new UIScrollRect(canvas)
    scrollableContainer.height = '22%'
    scrollableContainer.width = 338
    scrollableContainer.valueX = 1
    // scrollableContainer.backgroundColor = new Color4(1, 0, 0, .25)
    scrollableContainer.isVertical = true
    scrollableContainer.positionX = -17
    scrollableContainer.positionY = 25
    scrollableContainer.hAlign = "right"
    scrollableContainer.vAlign = "bottom"

    const invisibleWidth = new UIText(scrollableContainer)
    invisibleWidth.width = 338

    const shuffleButton = new UIImage(background, imageTexture)
    shuffleButton.width = 26
    shuffleButton.height = 18
    shuffleButton.positionX = -115
    shuffleButton.positionY = mediaHeight
    shuffleButton.sourceLeft = 349
    shuffleButton.sourceTop = 195
    shuffleButton.sourceWidth = 26
    shuffleButton.sourceHeight = 18
    shuffleButton.isPointerBlocker = true
    shuffleButton.onClick = new OnClick(() => {
      shuffleArray = shuffleReset()
      shuffleVal = 1
      shuffleButton.sourceTop = shuffleButton.sourceTop == 195 ? 227 : 195
      shuffle = shuffle ? 0: 1
    })

    const repeatButton = new UIImage(background, imageTexture)
    repeatButton.width = 32
    repeatButton.height = 22
    repeatButton.positionX = 110
    repeatButton.positionY = mediaHeight
    repeatButton.sourceLeft = 404
    repeatButton.sourceTop = 193
    repeatButton.sourceWidth = 32
    repeatButton.sourceHeight = 22
    repeatButton.isPointerBlocker = true
    repeatButton.onClick = new OnClick(() => {
      repeatButton.sourceTop = repeatButton.sourceTop == 193 ? 229 : 193
      loop = loop ? 0: 1
    })

    const rewindButton = new UIImage(background, imageTexture)
    rewindButton.width = 24
    rewindButton.height = 21
    rewindButton.positionX = -50
    rewindButton.positionY = mediaHeight
    rewindButton.sourceLeft = 341
    rewindButton.sourceTop = 164
    rewindButton.sourceWidth = 24
    rewindButton.sourceHeight = 21
    rewindButton.isPointerBlocker = true
    rewindButton.onClick = new OnClick(() => {
      stopButton.visible = true
      stopButton.isPointerBlocker = true
      playButton.visible = false
      playButton.isPointerBlocker = false
      switchSong(-1, "relative")
      updateTitle()
      triggerHighlight()
    })

    const forwardButton = new UIImage(background, imageTexture)
    forwardButton.width = 24
    forwardButton.height = 21
    forwardButton.positionX = 50
    forwardButton.positionY = mediaHeight
    forwardButton.sourceLeft = 415
    forwardButton.sourceTop = 164
    forwardButton.sourceWidth = 24
    forwardButton.sourceHeight = 21
    forwardButton.isPointerBlocker = true
    forwardButton.onClick = new OnClick(() => {
      stopButton.visible = true
      stopButton.isPointerBlocker = true
      playButton.visible = false
      playButton.isPointerBlocker = false
      if (shuffle){
        switchSong(shuffleArray[shuffleVal], "absolute")
        if (shuffleVal < songData.length-1){
          shuffleVal++
        } else {
          shuffler(shuffleArray)
          shuffleVal = 0
        }
      } else {
        switchSong(1, "relative")
      }
      updateTitle()
      triggerHighlight()
    })

    playButton.width = 21
    playButton.height = 21
    playButton.positionX = 0
    playButton.positionY = mediaHeight
    playButton.sourceLeft = 421
    playButton.sourceTop = 85
    playButton.sourceWidth = 21
    playButton.sourceHeight = 21
    playButton.isPointerBlocker = true
    playButton.onClick = new OnClick(() => {
      stopButton.visible = true
      stopButton.isPointerBlocker = true
      playButton.visible = false
      playButton.isPointerBlocker = false
      triggerHighlight()
      songLen = parseInt(songData[currSong].length.split(":", 2)[0])*60 + parseInt(songData[currSong].length.split(":", 2)[1])
      music.getComponent(AudioSource).playing = true
    })

    stopButton.width = 21
    stopButton.height = 21
    stopButton.positionX = 0
    stopButton.positionY = mediaHeight
    stopButton.sourceLeft = 341
    stopButton.sourceTop = 85
    stopButton.sourceWidth = 21
    stopButton.sourceHeight = 21
    stopButton.visible = false
    stopButton.isPointerBlocker = false
    stopButton.onClick = new OnClick(() => {
      playButton.visible = true
      playButton.isPointerBlocker = true
      stopButton.visible = false
      stopButton.isPointerBlocker = false
      for (let i = 0; i < songData.length; i++){
        if (queueTitleArray[i].color != Color3.White()){
          queueTitleArray[i].color = Color3.White()
        }
      }
      music.getComponent(AudioSource).playing = false
    })

    // Initializes text containers and queue play buttons
    for (let i = 0; i < songData.length; i++){
      queuePlayArray[i] = new UIImage(scrollableContainer, imageTexture)
      queueTitleArray[i] = new UIText(scrollableContainer)
      queueDescArray[i] = new UIText(scrollableContainer)
    }
  }
}