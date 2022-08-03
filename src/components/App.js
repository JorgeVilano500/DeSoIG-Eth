import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
import FileUploader from './FileUploader';

// connection to ipfs isn't possible because module cant be found 
// Hours spent on finding solution: 7
// Spent 7 hours total solved!!
// import {create} from 'ipfs-http-client'

//Declare IPFS
 const ipfsClient = require('ipfs-http-client')   
// const ipfs = create('http://localhost/3000')
 const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


// connect to blockchain by using Web3 library

class App extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null, 
      images: [], 
      loading: true, 

    }
  }


  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }
  async loadWeb3() { // will check if ethereum or web3 are in the window
    if(window.ethereum) {
       window.web3 = new Web3(window.ethereum) 
      // await window.ethereum.enable() // depreciated for some reason i guess 2 years is a long time for a tutorial 
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.setState({
        account: accounts[0]
      })
      console.log(this.state.account)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You Should consider trying MetaMask')
    }
  }

  async loadBlockchainData() { // will load the data of the user if it is true 
    const web3 =  window.web3;
    // load account 
   const accounts = await web3.eth.getAccounts()// have to put console.log inside parens in order to see the accounts
    // console.log(accounts) 
   this.setState({
      account: accounts[0]
    })

    //
    const networkId = await web3.eth.net.getId();
   // console.log(networkId) // in metamask you have to decide which test network to connect to
      // console.log(web3.eth.net) 
    // console.log(Decentragram.networks)
    const networkData = Decentragram.networks[networkId] // This is in order to connect to the network we are running from metamask. Lets say if we want to connect to ganauche the id will be 5777 but for unrecognized networks 421... it is not recognized
    //console.log(networkData)
    if(networkData) {
      const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address) // for address we need to look into the abi to see the networks port that supports the address
      //  / console.log(decentragram) 
      this.setState({decentragram})
      // need to get a count of images in order to display on the timeline
      
      //  console.log(decentragram.methods)
        const imagesCount = await decentragram.methods.imageCount().call() // have to use .call() because we are using web3, since we are reading this from the blockchain 
        // console.log(imagesCount)
        this.setState({imagesCount})
        this.setState({loading: false})
        let newArr = []
        // load images 
        for (let i = 1; i <= imagesCount ; i++) {
          const image = await decentragram.methods.images(i).call()// this calls on the mapping of images in  mapping(uint => Image) public images;  in the contract
          // newArr.push(image)
          //  console.log(image);
          this.setState({
            images: [...this.state.images, image] // take existing images and pop new image in for all of them to return together
            // images: newArr
          })

          // sort images
          this.setState({
            images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
          })



          this.setState({loading: false})
        }
        //  console.log(this.state.images)
    // console.log(this.state.images)
    
      } else {
      window.alert('Decentagram contract hasnt been deployed')
    }
  }

  catureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)// preprocesses the file into a format that IPFS is able to inspect. 

    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result)
      })
      console.log('buffer', this.state.buffer)
    }

  }

  uploadImage = async description => {
    console.log('Submitting file to ipfs')


    const { cid } = await ipfs.add(this.state.buffer)
    console.log(cid)
    console.log(cid._baseCache.get('z')) // need to use get method because the hash function is inside of a Map.
    this.setState({loading: true})
    this.state.decentragram.methods.uploadImage(cid._baseCache.get('z'), description).send({from: this.state.account}).on('transactionHash', (hash) =>{
      this.setState({loading: false})
    })
    
    // we use the cid to get the information of the picture and what we sent. 
    // we use the cid hash and link it with ipfs.infura.io/ipfs/CID_HASH in order to link us to the image we left up there. 

  }

  tipImageOwner = async (id, tipAmount) => {
    this.setState({loading:true})
    this.state.decentragram.methods.tipImageOwner(id).send({from:this.state.account, value: tipAmount}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }




  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            captureFile={this.catureFile}
            images={this.state.images}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
            />
          }
        
      </div>
    );
  }
}

export default App;

/**
 * would put this inside of the add funtion for ipfs but it doesnt accept additional options/parameters for its function.
 * Will figure out a way to change the states and upload image
 * (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({loading: true})
      console.log(result)
      this.state.decentragram.methods.uploadImage(result.hash[0], description).send({from: this.state.account}).on('transactional', (hash) => {
        this.setState({loading: false})
      })
    }
 */

    // we do .call when we want to read from the blockchain 
    // we do .send with an account that its from to create transactions on the blockchain