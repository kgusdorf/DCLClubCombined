import { getProvider } from '@decentraland/web3-provider';
import { getUserAccount } from '@decentraland/EthereumController';
import * as EthConnect from '../node_modules/eth-connect/esm';
import ABIMANA from '../contracts/ABIMANA';
import {DiscoBall} from 'modules/DiscoBall';
import {MusicPlayer} from 'modules/MusicPlayer';
import {Elevator} from 'modules/Elevator';

// Custom component used to hold door rotation data
@Component('SlerpData')
export class SlerpData {
  originRot: Quaternion = Quaternion.Euler(0, 0, 0)
  targetRot: Quaternion = Quaternion.Euler(0, 90, 0)
  fraction: number = 0
}

// Door rotation system
export class SlerpRotate implements ISystem {
  update(dt: number) {
    const doors = engine.getComponentGroup(SlerpData)
    for (let entity of doors.entities) {
      let slerp = entity.getComponent(SlerpData)
      let transform = entity.getComponent(Transform)
      if (slerp.fraction < 1) {
        let rot = Quaternion.Slerp(slerp.originRot, slerp.targetRot, slerp.fraction)
        transform.rotation = rot  
        slerp.fraction += dt/5 
      }
    }
  }
}

// Store disco ball and elevator objects in variables
const disco = new DiscoBall(new Vector3(8, 5, 9), 0.5)
const elevator = new Elevator(new Vector3(13.7, 0, 10), [0, 5.4, 11.7])

// Used to keep track if doors have already been opened
let doorOpened : boolean = false

// Prompts user to pay 100 MANA; if success, doors open and disco ball; if failure, nothing occurs
function payment(){
  executeTask(async () => {
    try {
      const provider = await getProvider()
      const requestManager = new EthConnect.RequestManager(provider)
      const factory = new EthConnect.ContractFactory(requestManager, ABIMANA)
      const contract = (await factory.at(
        '0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb'
      )) as any
      const address = await getUserAccount()
      log(address)

      const res = await contract.transfer(
        '0x219bb791955d1A3556AD4eB5DbcCbC64f60DB23B', 100000000000000000000,
        { from: address }
      )
      log(res)
      engine.addSystem(new SlerpRotate())
      disco.startSystem()
      player.whenDoorOpens()
      doorOpened = true
    } catch (error) {
      log(error.toString());
    }
  })
}

// Create door entities and give them proper OnClick and SlerpData components
const door1 = new Entity()
door1.addComponent(new GLTFShape("models/scene/door.glb"))
door1.addComponent(new Transform({
  position: new Vector3(3.4, -0.16, 14.35),
  scale: new Vector3(1.5, 1.5, 1.5)
}))
door1.addComponent(new OnClick( e => {
  if (!doorOpened){
    payment()
  }
}))
door1.addComponent(new SlerpData())
engine.addEntity(door1)

const door2 = new Entity()
door2.addComponent(new GLTFShape("models/scene/door.glb"))
door2.addComponent(new Transform({
  position: new Vector3(7.14, 4.3, 14.35),
  scale: new Vector3(1.5, 1.5, 1.5),
  rotation: Quaternion.Euler(0, 0, 180)
}))
door2.addComponent(new OnClick( e => {
  if (!doorOpened){
    payment()
  }
}))
door2.addComponent(new SlerpData())
door2.getComponent(SlerpData).originRot = Quaternion.Euler(0, 0, 180)
door2.getComponent(SlerpData).targetRot = Quaternion.Euler(0, -90, 180)
engine.addEntity(door2)

// Create building entity
const building = new Entity()
building.addComponent(new GLTFShape("models/scene/building.glb"))
building.addComponent(new Transform({
  position: new Vector3(8, 0, 8.6),
  scale: new Vector3(1.4, 1.4, 1.4)
}))
engine.addEntity(building)

const player = new MusicPlayer()