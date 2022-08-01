const { assert } = require('chai')

const Decentragram = artifacts.require('./Decentragram.sol')
// do 'truffle test' in command line to test all these and see if the smart contract is working properly. 
// always test contract because we can't change it once its on the blockchain. we have to replace it with a similar one. 
require('chai')
  .use(require('chai-as-promised'))
  .should()

  // all of these tests are written in mocha. Have to research tests. 
contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {// checks address of the smart contracts
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })
  describe('images', async () => {
    const hash = 'abc123'
    let result, imageCount

    before(async () => {
      result = await decentragram.uploadImage(hash, 'Image Description', {from: author});// 3rd argument is json as metadata
      imageCount = await decentragram.imageCount();
    })
    
    it('creates images', async() => {
      // result = await decentragram.uploadImage();// uploads image into the blockchain. 
      // let image = await decentragram.images(1);// image will be called and the information is available from the specific image. doesnt return entire image mapping.  need to call each individual image by passing Id
      // console.log(image);
      
      //Success
      assert.equal(imageCount, 1)
    //  console.log(result.logs[0].args);// data comes back where it has been uploadImage()
      const event = result.logs[0].args; // these tests will determine each value in the event tho make sure it is valid
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Image Description', 'description is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      //Falure: image must have hash 
      await decentragram.uploadImage('', 'Image Description', {from: author}).should.be.rejected

      //Failure: image must have description
      await decentragram.uploadImage('Image Hash', '', {from: author}).should.be.rejected

      //Failure: image must have address


    })

    //check from Struct 
    it('lists images', async() => {
      const image = await decentragram.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'ide is correct')
      assert.equal(image.hash, hash, 'Hash is correct')
      assert.equal(image.description, 'Image Description', 'descriptoin is correct')
      assert.equal(image.tipAmount, '0', 'tip amount is correct')
      assert.equal(image.author, author, 'author is correct')
    })


    it('allows users to tip images', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Image Description', 'description is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1', 'Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      // FAILURE: Tries to tip a image that does not exist
      await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })


  })
})