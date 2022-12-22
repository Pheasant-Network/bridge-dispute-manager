const { expect, assert } = require('chai');
const { ethers } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');
const utils = require('./utils.js');
const TestData = utils.TestData;
const rlp = require('rlp');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

describe('BridgeDisputeManager', function (/* accounts */) {
  let RLPDecoder;
  let rlpDecoder;
  let DecoderHelper;
  let decoderHelper;
  let TestToken;
  let testToken;
  let TestCheckPointManager;
  let testCheckPointManager;

  let BridgeDisputeManager;
  let bridgeDisputeManager;
  let accounts;
  let DisputeHelper;
  let disputeHelper;

  before(async () => {
    accounts = await ethers.getSigners();
    RLPDecoder = await hre.ethers.getContractFactory('SolRLPDecoder');
    rlpDecoder = await RLPDecoder.deploy();
    DecoderHelper = await hre.ethers.getContractFactory('DecoderHelper', {
      libraries: {
        SolRLPDecoder: rlpDecoder.address,
      },
    });
    decoderHelper = await DecoderHelper.deploy();
    TestToken = await hre.ethers.getContractFactory('TestToken');
    TestCheckPointManager = await hre.ethers.getContractFactory(
      'TestCheckPointManager',
    );
    testCheckPointManager = await TestCheckPointManager.deploy();
  });

  beforeEach(async () => {
    testToken = await TestToken.connect(accounts[0]).deploy(
      accounts[0].address,
    );

    const BridgeDisputeManager = await hre.ethers.getContractFactory(
      'BridgeDisputeManager',
      {
        libraries: {
          SolRLPDecoder: rlpDecoder.address,
        },
      },
    );

    const DisputeHelper = await hre.ethers.getContractFactory('DisputeHelper', {
      libraries: {
        SolRLPDecoder: rlpDecoder.address,
      },
    });

    bridgeDisputeManager = await BridgeDisputeManager.connect(
      accounts[0],
    ).deploy(testCheckPointManager.address);
    disputeHelper = await DisputeHelper.connect(accounts[0]).deploy(
      testCheckPointManager.address,
    );

    testData = new TestData(accounts, disputeHelper);
  });
  it('verifyBlockHeader', async function () {
    const testBlockHeader = testData.getBlockHeaderData(0);
    const encoded = rlp.encode(testBlockHeader.blockHeader);
    const encodedHex = '0x' + encoded.toString('hex');
    const hash = await ethers.utils.keccak256(encodedHex);

    const result = await bridgeDisputeManager.verifyBlockHeader(
      testBlockHeader.blockHash,
      testBlockHeader.blockHeader,
    );
    assert.isTrue(result);
    assert.equal(testBlockHeader.blockHash, hash);
  });

  it('verifyBlockHeader false', async function () {
    const testBlockHeader = testData.getBlockHeaderData(1);
    const encoded = rlp.encode(testBlockHeader.blockHeader);
    const encodedHex = '0x' + encoded.toString('hex');
    const hash = await ethers.utils.keccak256(encodedHex);

    const result = await bridgeDisputeManager.verifyBlockHeader(
      testBlockHeader.blockHash,
      testBlockHeader.blockHeader,
    );
    assert.isNotTrue(result);
    assert.notEqual(testBlockHeader.blockHash, hash);
  });

  it('bufferToNibble', async function () {
    const bufferStringArray = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
    ];
    const buffer = Buffer.from(bufferStringArray.join(''), 'hex');
    const result = await disputeHelper.helperBufferToNibble(buffer);
    assert.equal(bufferStringArray.length, result.length);
    for (let i = 0; i < result.length; i++) {
      assert.equal(result[i].toString(16), bufferStringArray[i]);
    }
  });

  it('verifyProof', async function () {
    const testProof = testData.getProofData(0);
    const result = await bridgeDisputeManager.verifyProof(
      testProof.txHash,
      testProof.proof,
      testProof.txRoot,
      testProof.path,
    );
    assert.isTrue(result);
  });

  it('verifyProof wrong root', async function () {
    const testProof = testData.getProofData(1);
    const result = await bridgeDisputeManager.verifyProof(
      testProof.txHash,
      testProof.proof,
      testProof.txRoot,
      testProof.path,
    )
    assert.equal(result, false);
  });

  // todo
  it('verifyProof invalid proof', async function () {

  });

  // todo
  it('verifyProof invalid path', async function () {

  });

  it('verifyTxSignature', async function () {
    const testTx = testData.getTxData(0);
    const result = await bridgeDisputeManager.verifyTxSignature(
      testTx.address,
      testTx.rawTx,
    );

    assert.isTrue(result);
    const testTx2 = testData.getTxData(1);
    const result2 = await bridgeDisputeManager.verifyTxSignature(
      testTx2.address,
      testTx2.rawTx,
    );

    assert.isTrue(result2);
  });

  it('verifyTxSignature false', async function () {
    const testTx = testData.getTxData(2);
    const result = await bridgeDisputeManager.verifyTxSignature(
      testTx.address,
      testTx.rawTx,
    );

    assert.isNotTrue(result);
  });

  it('verifyBlockHash', async function () {
    const blockHash =
      '0xd858caa161bde78ebc8a8fe12adae6ecf7f0bcb8b1547b992215bf13fdbe17f9';
    const blockNumber = 5858981;
    await testCheckPointManager
      .connect(accounts[0])
      .setBlockHash(blockNumber, blockHash);
    const blockHashResult = await testCheckPointManager.getBlockHash(
      blockNumber,
    );

    assert.equal(blockHashResult, blockHash);
    const result = await bridgeDisputeManager.verifyBlockHash(
      blockHash,
      blockNumber,
    );
    assert.isTrue(result);
  });

  it('verifyBlockHash blockhash not match', async function () {
    const blockHash =
      '0xd858caa161bde78ebc8a8fe12adae6ecf7f0bcb8b1547b992215bf13fdbe17f9';
    const notMatchBlockHash =
      '0xd792952703adf456f92a4298f396da0fc5f771afd2082b46c9c5b2118e10db1c';

    const blockNumber = 5858981;
    await testCheckPointManager
      .connect(accounts[0])
      .setBlockHash(blockNumber, notMatchBlockHash);
    const blockHashResult = await testCheckPointManager.getBlockHash(
      blockNumber,
    );

    assert.equal(blockHashResult, notMatchBlockHash);
    const result = await bridgeDisputeManager.verifyBlockHash(
      blockHash,
      blockNumber,
    );
    assert.isFalse(result);
  });



  it('verifyBlockHash not set', async function () {
    const blockHash =
      '0xd858caa161bde78ebc8a8fe12adae6ecf7f0bcb8b1547b992215bf13fdbe17f9';
    const blockNumber = 5858982;
    await expect(
      bridgeDisputeManager.verifyBlockHash(blockHash,blockNumber)
    ).to.be.revertedWith("Relay blockhash first");
  });

  it('verifyRawTx', async function () {
    const testTx = testData.getTxData(3);
    const encoded = rlp.encode(testTx.rawTx);
    const encodedHex = '0x02' + encoded.toString('hex'); //type2 tx

    const result = await bridgeDisputeManager.verifyRawTx(
      testTx.transaction,
      testTx.rawTx,
    );
    assert.isTrue(result);
    assert.equal(encodedHex, testTx.transaction);
  });

  it('verifyRawTx false', async function () {
    const testTx = testData.getTxData(4);
    const encoded = rlp.encode(testTx.rawTx);
    const encodedHex = '0x02' + encoded.toString('hex'); //type2 tx

    const result = await bridgeDisputeManager.verifyRawTx(
      testTx.transaction,
      testTx.rawTx,
    );
    assert.isNotTrue(result);
    assert.notEqual(encodedHex, testTx.transaction);
  });

  it('checkTransferTx', async function () {
    const testTx = testData.getTransferTxData(0);
    let result = await disputeHelper.checkTransferTx(
      testTx.transaction,
      testTx.to,
      testTx.amount,
    );
    assert.equal(result, true);
  });

  it('checkTransferTx, invalid to', async function () {
    const testTx = testData.getTransferTxData(1);
    let result = await disputeHelper.checkTransferTx(
      testTx.transaction,
      testTx.to,
      testTx.amount,
    );
    assert.equal(result, false);
  });

  it('checkTransferTx, invalid amount', async function () {
    const testTx = testData.getTransferTxData(2);
    let result = await disputeHelper.checkTransferTx(
      testTx.transaction,
      testTx.to,
      testTx.amount,
    );
    assert.equal(result, false);
  });
});

describe('RLPDecoder', function (/* accounts */) {
  let RLPDecoder;
  let rlpDecoder;
  let DecoderHelper;
  let decoderHelper;

  before(async () => {
    accounts = await ethers.getSigners();
    RLPDecoder = await hre.ethers.getContractFactory('SolRLPDecoder');
    rlpDecoder = await RLPDecoder.deploy();
    DecoderHelper = await hre.ethers.getContractFactory('DecoderHelper', {
      libraries: {
        SolRLPDecoder: rlpDecoder.address,
      },
    });
    decoderHelper = await DecoderHelper.deploy();
  });

  it('first byte < 0x7f, return byte itself', async function () {
    const decoded = await decoderHelper.decode('0x61');
    assert.equal(4, decoded[0].length);
    assert.equal(decoded[0], '0x61');
  });

  it('first byte < 0xb7, data is everything except first byte', async function () {
    const decoded = await decoderHelper.decode('0x83646f67');
    assert.equal(8, decoded[0].length);
    assert.equal(decoded[0], '0x646f67');
  });

  it('first byte == 0x80, data is null', async function () {
    const decoded = await decoderHelper.decode('0x80');
    assert.equal(decoded[0], '0x');
  });

  it('strings over 55 bytes long', async function () {
    const testString =
      'This function takes in a data, convert it to buffer if not, and a length for recursion';
    const testBuffer = Buffer.from(testString);
    const encoded = rlp.encode(testBuffer);
    //console.log(testBuffer.toString('hex'));
    const encodedHex =
      '0x' + Buffer.from(new Uint8Array(encoded)).toString('hex');
    const decoded = await decoderHelper.decode(encodedHex);
    assert.equal(
      Buffer.from(decoded[0].slice(2), 'hex').toString(),
      testString,
    );
  });

  it('a list', async function () {
    const list = [
      '0x54686973',
      '0x546869732066756e6374696f6e2074616b657320696e206120646174612c20636f6e7665727420697420746f20627566666572206966206e6f742c20616e642061206c656e67746820666f7220726563757273696f6e',
      '0x07',
      '0x05',
      ,
    ];
    const encoded = rlp.encode(list);
    const encodedHex =
      '0x' + Buffer.from(new Uint8Array(encoded)).toString('hex');
    const decoded = await decoderHelper.decode(encodedHex);
    assert.deepEqual(decoded, [
      '0x54686973',
      '0x546869732066756e6374696f6e2074616b657320696e206120646174612c20636f6e7665727420697420746f20627566666572206966206e6f742c20616e642061206c656e67746820666f7220726563757273696f6e',
      '0x07',
      '0x05',
      '0x',
    ]);
  });

  it('a list  over 55 bytes long', async function () {
    const list = [
      'This',
      'function',
      'takes',
      'in',
      'a',
      'data',
      'convert',
      'it',
      'to',
      'buffer',
      'if',
      'not',
      'and',
      'a',
      'length',
      'for',
      'recursion',
      'a1',
      'a2',
      'a3',
      'ia4',
      'a5',
      'a6',
      'a7',
      'a8',
      'ba9',
    ];

    const encoded = rlp.encode(list);
    const encodedHex =
      '0x' + Buffer.from(new Uint8Array(encoded)).toString('hex');
    const decoded = await decoderHelper.decode(encodedHex);

    const decodedBuffer = rlp.decode(encoded);
    let rlpdecoded = [];
    for (let i = 0; i < decodedBuffer.length; i++) {
      rlpdecoded[i] = '0x' + decodedBuffer[i].toString('hex');
    }

    assert.deepEqual(decoded, rlpdecoded);
  });

  it('decode a long list using actual data', async function () {
    const string =
      '0xf90131a0b7030de7565b7531315fefd37f135a84fcfc82896e38bf7321d458d6846c4285a04c05e9cd442533a0fe8cfa6948540dc3e178f6add3fe1a4a253694d345b97198a0667e9f9a0e2a7ee536a4c9bd2013d06296430ae8181ea08c76c737debf379d63a01d1146f205eaeca9bf69943a5882e81de1ac7e7fceaf112af76bf29deb34bc47a022715dfc9109f2e78dbc177f48b3e181ad3044b936e3d50ddc958c42ff76a23fa00c32dd02fc4143baa82d42182151637ac256e6262036dc9c353c561b8b15b8d1a055c39110aff8d0a5469fd6a3dfa966dbbd0ae726c8ecab006a3093806c45e03ba0d6bdf0cc3e37ae46f2a295d18f35cd019bb4d189a1c18fb94ae38e70c6b8eae8a0cedb936c7df2fb8e6720770b3eab8ff0320182b0e2a28c517e38bcbdbc13178f8080808080808080';

    const encoded = Buffer.from(string.slice(2), 'hex');
    const decodedBuffer = rlp.decode(encoded);
    const decoded = await decoderHelper.decode(string);
    let rlpdecoded = [];
    for (let i = 0; i < decodedBuffer.length; i++) {
      rlpdecoded[i] = '0x' + decodedBuffer[i].toString('hex');
    }
    assert.deepEqual(decoded, rlpdecoded);
  });
});
