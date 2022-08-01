import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'

// connection to ipfs isn't possible because module cant be found 
// Hours spent on finding solution: 5
import {create} from 'ipfs-http-client'

//Declare IPFS
// const ipfsClient = require('ipfs-http-client')   
// const ipfs = create('http://localhost/3000')
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


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
    //load account 
   // const accounts = await web3.eth.getAccounts()// have to put console.log inside parens in order to see the accounts
    // this.setState({
    //   account: accounts
    // })

    //
    const networkId = await web3.eth.net.getId();
    const networkData = Decentragram.networks[networkId]
    if(networkData) {
      const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address) // for address we need to look into the abi to see the networks port that supports the address
       this.setState({decentragram})
      // need to get a count of images in order to display on the timeline
       const imagesCount = await decentragram.methods.imageCount().call() // have to use .call() because we are using web3, since we are reading this from the blockchain 
        this.setState({imagesCount})

        this.setState({loading: false})
    
    
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

  uploadImage = description => {
    console.log('Submitting file to ipfs')


    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      // this.setState({loading: true})
      // this.state.decentragram.methods.uploadImage(result[0].hash, description).send({from: this.state.account}).on('transactional', (hash) => {
      //   this.setState({loading: false})
      // })
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
            uploadImage={this.uploadImage}
            />
          }
        
      </div>
    );
  }
}

export default App;