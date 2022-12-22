const BridgeDisputeManager = artifacts.require("BridgeDisputeManager");
const DisputeHelper = artifacts.require("DisputeHelper");
const TestToken = artifacts.require("TestToken");
const TestCheckPointManager = artifacts.require("TestCheckPointManager");
const RLPDecoder = artifacts.require("RLPDecoder");
const decoderHelper = artifacts.require("DecoderHelper");
const Web3 = require('web3');
const rlp = require('rlp');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require('dotenv');
dotenv.config();

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

contract("BridgeDisputeManager", function (/* accounts */) {

  let bridgeDisputeManager;
  let testCheckPointManager;
  let testToken;
  let accounts;
  let txParams;
  let helper;
  let disputeHelper;
  let rlpDecoder;

  const web3 = new Web3('http://localhost:8545');    

  before(async () => {
    rlpDecoder = await decoderHelper.deployed();
    accounts = await web3.eth.getAccounts();
    txParams = { from: accounts[0] };
    testToken = await TestToken.new(accounts[0], txParams);
    testCheckPointManager = await TestCheckPointManager.new();
  });

  beforeEach(async () => {
    bridgeDisputeManager = await BridgeDisputeManager.new(testCheckPointManager.address, txParams);
    disputeHelper = await DisputeHelper.new(testCheckPointManager.address, txParams);
  });
  it("verifyBlockHeader", async function () {
    const blockHash = "0xd792952703adf456f92a4298f396da0fc5f771afd2082b46c9c5b2118e10db1c";
    const blockHeader =
    [ 
      "0x671d6e9a041f1b41743faaae21331b46e72d99cbd4fd5fb60477d7f16268f7dc",
      "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "0x0000000000000000000000000000000000000000",
      "0x711bec99efae8b9dbad390d6d86ff819ec676c13142ba53cdf79ab3e8d529b80",
      "0x6620503086737b0b3b424d816cab4f06d7d7a004d457b409c606955134d816a8",
      "0x75f25da7d96b85673bd63fc48057d47a62c607787d60c044ba49869f304c166e",
       "0x0000040000001000000004000c0040000002400004000008000100220000000000100000000000808000000000040020802000000042080400000000002100400088080000000000000002080020280000000224014000000400008800080800000000002200000000000000800008000406004000082100000000100000009000000000400200100008200240000008000004810040000000000000040000100a0000501080040080000080000000000004000011040020000040000000000100000002000002204000000000001000002000000000000000004200800020000010000000004040000000000001000010120140000000040000002000400009",
      "0x02",
      "0x5ed90c",
      "0x01c9c380",
      "0x14e608",
      "0x61e54773",
      "0x0000000000000000000000000000000000000000000000000000000000000000e985ea5a68911d86ff0e269231e6f97f6f9a7a576e6afa2605b8a9d7442d3b7a74ab4290c82f85cf2b50bfd7aa3af771725998e7cb7ba5695d890c21da8a0e0201",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000",
      "0x07"
    ]


    const result = await bridgeDisputeManager.verifyBlockHeader(blockHash, blockHeader);
    assert.isTrue(result);
  });


  it("verifyBlockHeader false", async function () {
    const blockHash = "0xcc43d2fc3f894c5d99661c4d02c95479d13355533641755ab51f4b858853312a"; //wrong block hash
    const blockHeader =
    [ 
      "0x671d6e9a041f1b41743faaae21331b46e72d99cbd4fd5fb60477d7f16268f7dc",
      "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "0x0000000000000000000000000000000000000000",
      "0x711bec99efae8b9dbad390d6d86ff819ec676c13142ba53cdf79ab3e8d529b80",
      "0x6620503086737b0b3b424d816cab4f06d7d7a004d457b409c606955134d816a8",
      "0x75f25da7d96b85673bd63fc48057d47a62c607787d60c044ba49869f304c166e",
       "0x0000040000001000000004000c0040000002400004000008000100220000000000100000000000808000000000040020802000000042080400000000002100400088080000000000000002080020280000000224014000000400008800080800000000002200000000000000800008000406004000082100000000100000009000000000400200100008200240000008000004810040000000000000040000100a0000501080040080000080000000000004000011040020000040000000000100000002000002204000000000001000002000000000000000004200800020000010000000004040000000000001000010120140000000040000002000400009",
      "0x02",
      "0x5ed90c",
      "0x01c9c380",
      "0x14e608",
      "0x61e54773",
      "0x0000000000000000000000000000000000000000000000000000000000000000e985ea5a68911d86ff0e269231e6f97f6f9a7a576e6afa2605b8a9d7442d3b7a74ab4290c82f85cf2b50bfd7aa3af771725998e7cb7ba5695d890c21da8a0e0201",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000",
      "0x07"
    ]

    const result = await bridgeDisputeManager.verifyBlockHeader(blockHash, blockHeader);
    assert.isNotTrue(result);
  });


  it("bufferToNibble", async function () {

    const bufferStringArray = [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c"]; 
    const buffer = Buffer.from(bufferStringArray.join(''), 'hex');
    const result = await disputeHelper.helperBufferToNibble(buffer);
    assert.equal(bufferStringArray.length, result.length)
    for(let i = 0; i < result.length; i++) {
      assert.equal(result[i].toString(16), bufferStringArray[i])
    }
  });

  it("verifyProof", async function () {

    const txHash = "0x87408fdb8cab715a54fef2f4fcade724a2ab8af0514ad87e4dfba605142048bf";
    const proof = [
    '0xf891a005b1b90ba86ef738bfb79d677668ac86829e9a087cf64a673e589ed52862e1bca03e651f383233f5d08ec2cd677e348c645c091cc5e5b431462ef4c5dc7ce84094a0573115215b322a70bf9154ef1bbb4f7d211fa11d831a836f9fac8c0c53c38afe8080808080a03c6a2c95680e0ce8b03065247b48a42c4f452472a60a89d5a3bc125edf5a38fc8080808080808080',
    '0xf90211a0245b86faa0fff7239732c5349f229000c0e979d02bbb7a4bdb81fdba765f9e9ba08f74444d640bf6b863313916ecd0798353f79b3077dba677483cf4014cf40407a013dfe71408a18d8044388894a507011b85ff9a33e43cdda7db2ade4308410d6aa008bab891c3f197e91ae52f500e715191fea5d4ebf556adfc5a913d17bca1d577a05e9dcc160d74c6ddc009551303c9233632a9ded8547d7dfff7a06368a5b16735a052b8f0e2555adbc5304e4f4117a5c02dc8ebdaf54252c6059fccc2998aacfc31a01f622b8dd4440f1075cec6a2c958b85e8191969cde8ef6b4d1796d25d465de34a08d3c3e9bf22c8452bc289a36d74233e5a4d1d6279d25a946251cf2dc98832564a06274b385050b58ce3bb24f959d745e4777b60b006c4f8643616b190428530f20a04cef9af88fa29a7b75abede8165ac394b4aa32f380788fef72dda422e010739ba006677bc336eb4c0442b926599872fcac00eb20823756540ccd67cae3eedfb9d8a018163956275c644e8ee2d27ef703805bd844c9751b7a8007ea9ac5354e56c43aa071b5ef7db89662cfa5a4c127a1605af600325b7f29ee5cc0dcfb10d64e5c3e8fa0163f15d795eef33faac6b85820f6c0fdc292ba5bc0dc7ff0073c7a29c2912929a051c32cd22d214cce0a298584502947fada07d775b0b4eca44da9b30b86967d0ca0ff1f887c345f629b226d3590db3a8ad981d84df527c9ab0a83332bf9a777630c80',
    '0xf8b620b8b302f8b005808459682f008459682f098301330e94582525da8d609b7fa7c3a58ccdc59d4ab92bfa5780b844a9059cbb000000000000000000000000e202b444db397f53ae05149fe2843d7841a2dcbe00000000000000000000000000000000000000000000021e19e0c9bab2400000c001a0ae7456d7d684bb97429079b14366ed6fcb4b55830136bc8bb1a8348c9d8043c1a05379dc47e2253044a1c93c15029af516b664f9a045c2f0ed8063c502aa5eb5f7'
  ];
    const txRoot = "0x3087644bce2559e711ec1c30b3620e68b3178114354c373a4d5c32120c4287f4";
    const path = [ 1, 13 ];

    const result = await bridgeDisputeManager.verifyProof(txHash, proof, txRoot, path);
    assert.isTrue(result);

  });

  it("verifyProof wrong root", async function () {

    const txHash = "0x87408fdb8cab715a54fef2f4fcade724a2ab8af0514ad87e4dfba605142048bf";
    const proof = [
    '0xf891a005b1b90ba86ef738bfb79d677668ac86829e9a087cf64a673e589ed52862e1bca03e651f383233f5d08ec2cd677e348c645c091cc5e5b431462ef4c5dc7ce84094a0573115215b322a70bf9154ef1bbb4f7d211fa11d831a836f9fac8c0c53c38afe8080808080a03c6a2c95680e0ce8b03065247b48a42c4f452472a60a89d5a3bc125edf5a38fc8080808080808080',
    '0xf90211a0245b86faa0fff7239732c5349f229000c0e979d02bbb7a4bdb81fdba765f9e9ba08f74444d640bf6b863313916ecd0798353f79b3077dba677483cf4014cf40407a013dfe71408a18d8044388894a507011b85ff9a33e43cdda7db2ade4308410d6aa008bab891c3f197e91ae52f500e715191fea5d4ebf556adfc5a913d17bca1d577a05e9dcc160d74c6ddc009551303c9233632a9ded8547d7dfff7a06368a5b16735a052b8f0e2555adbc5304e4f4117a5c02dc8ebdaf54252c6059fccc2998aacfc31a01f622b8dd4440f1075cec6a2c958b85e8191969cde8ef6b4d1796d25d465de34a08d3c3e9bf22c8452bc289a36d74233e5a4d1d6279d25a946251cf2dc98832564a06274b385050b58ce3bb24f959d745e4777b60b006c4f8643616b190428530f20a04cef9af88fa29a7b75abede8165ac394b4aa32f380788fef72dda422e010739ba006677bc336eb4c0442b926599872fcac00eb20823756540ccd67cae3eedfb9d8a018163956275c644e8ee2d27ef703805bd844c9751b7a8007ea9ac5354e56c43aa071b5ef7db89662cfa5a4c127a1605af600325b7f29ee5cc0dcfb10d64e5c3e8fa0163f15d795eef33faac6b85820f6c0fdc292ba5bc0dc7ff0073c7a29c2912929a051c32cd22d214cce0a298584502947fada07d775b0b4eca44da9b30b86967d0ca0ff1f887c345f629b226d3590db3a8ad981d84df527c9ab0a83332bf9a777630c80',
    '0xf8b620b8b302f8b005808459682f008459682f098301330e94582525da8d609b7fa7c3a58ccdc59d4ab92bfa5780b844a9059cbb000000000000000000000000e202b444db397f53ae05149fe2843d7841a2dcbe00000000000000000000000000000000000000000000021e19e0c9bab2400000c001a0ae7456d7d684bb97429079b14366ed6fcb4b55830136bc8bb1a8348c9d8043c1a05379dc47e2253044a1c93c15029af516b664f9a045c2f0ed8063c502aa5eb5f7'
  ];
    const txRoot = "0xf94fdd74f197425dda1eeef534497f407158d845cac9092a5b7fea9681dbb239"; //wrong root
    const path = [ 1, 13 ];
    try {
      const result = await bridgeDisputeManager.verifyProof(txHash, proof, txRoot, path);
      assert.fail();
    }catch(e) {
      assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Invalid Tx Root");
    }

  });



  it("verifyTxSignature", async function () {
    var list = [
      '0x05',
      '0x06',
      '0x59682f00',
      '0x59682f0a',
      '0x12da1',
      '0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae',
      '0x',
      '0xa9059cbb000000000000000000000000578d9b2d04bc99007b941787e88e4ea57d888a560000000000000000000000000000000000000000000000000de0b6b3a7640000',
      [],
      '0x',
      '0x10e1dcf5759151ab38ff9bdfa9e0ffa291e7c91ecc078d37a51cc1695b6b61b7',
      '0x6581c44376517a9906918379e87cf22d61f59e95cb29776fde2d7ae655e758da'
    ]

    const address = "0xE202B444Db397F53AE05149fE2843D7841A2dCBE";
    const result = await bridgeDisputeManager.verifyTxSignature(address, list);

    assert.isTrue(result);

    var list2 = [
      '0x05',
      '0x10',
      '0x59682f00',
      '0x59682f09',
      '0x0aad87',
      '0x75d5e88adf8F3597c7C3e4a930544FB48089C779',
      '0x',
      '0x69328dec0000000000000000000000004a55a3a00d3afd19062dcad21b24c09d935f895a00000000000000000000000000000000000000000000000963a185106dd691dc00000000000000000000000067260f925d901e9cd9b113ba2ec06c7af53560bd',
      [],
      '0x01',
      '0xdc0c502fde9fafc6951a31e24e32ec996d1c04d6953117746cf47dc33e1e5d43',
      '0x36288ccd52fc8c07ab05d051f7cd61bd6d4813442cdd4e7cbe35204532c2fbe3',
    ]

    const address2 = "0x67260f925D901e9Cd9b113BA2Ec06c7Af53560Bd";
    const result2 = await bridgeDisputeManager.verifyTxSignature(address2, list2);

    assert.isTrue(result2);
  });


  it("verifyTxSignature false", async function () {
    var list = [
      '0x05',
      '0x06',
      '0x59682f00',
      '0x59682f0a',
      '0x12da1',
      '0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae',
      '0x',
      '0xa9059cbb000000000000000000000000578d9b2d04bc99007b941787e88e4ea57d888a560000000000000000000000000000000000000000000000000de0b6b3a7640000',
      [],
      '0x01', //wrong parity
      '0x10e1dcf5759151ab38ff9bdfa9e0ffa291e7c91ecc078d37a51cc1695b6b61b7',
      '0x6581c44376517a9906918379e87cf22d61f59e95cb29776fde2d7ae655e758da'
    ]

    const address = "0xE202B444Db397F53AE05149fE2843D7841A2dCBE";
    const result = await bridgeDisputeManager.verifyTxSignature(address, list);

    assert.isNotTrue(result);
  });


  it("verifyBlockHash", async function () {
    const blockHash = "0xd858caa161bde78ebc8a8fe12adae6ecf7f0bcb8b1547b992215bf13fdbe17f9";
    const blockNumber = 5858981;
    await testCheckPointManager.setBlockHash(blockNumber, blockHash, {from:accounts[0]});
    const blockHashResult = await testCheckPointManager.getBlockHash(blockNumber);

    assert.equal(blockHashResult, blockHash)
    const result = await bridgeDisputeManager.verifyBlockHash.call(blockHash, blockNumber);
    assert.isTrue(result);
  });


  it("verifyRawTx", async function () {
    const rawTx = [ 
       '0x05',
       '0x',
       '0x7029fd38',
       '0x7029fd42',
       '0x5208',
       '0xb0E426B1A0B8BA474Dc5c8F6493B3E63D7121626',
       '0x5af3107a4000',
       '0x',
       [],
       '0x',
       '0xe652f92895753c04e12dec82396722de717cb6e23311b09848c3f8e7f6ec712c',
       '0x6c9fa23e04fa2a05509fd426d0e4a64e96278af74034bae52f3bef7af1cb6e83'
    ]

    const transaction = '0x02f8700580847029fd38847029fd4282520894b0e426b1a0b8ba474dc5c8f6493b3e63d7121626865af3107a400080c080a0e652f92895753c04e12dec82396722de717cb6e23311b09848c3f8e7f6ec712ca06c9fa23e04fa2a05509fd426d0e4a64e96278af74034bae52f3bef7af1cb6e83'

    const result = await bridgeDisputeManager.verifyRawTx.call(transaction, rawTx);
    assert.isTrue(result);
  });

  it("verifyRawTx false", async function () {
    const rawTx = [ 
       '0x05',
       '0x',
       '0x7029fd38',
       '0x7029fd42',
       '0x5208',
       '0xb0E426B1A0B8BA474Dc5c8F6493B3E63D7121626',
       '0x5af3107a4000',
       '0x',
       [],
       '0x',
       '0xe652f92895753c04e12dec82396722de717cb6e23311b09848c3f8e7f6ec712c',
       '0x6c9fa23e04fa2a05509fd426d0e4a64e96278af74034bae52f3bef7af1cb6e83'
    ]

    const transaction = '0x02f87305820295849502f900849502f90e82791894e202b444db397f53ae05149fe2843d7841a2dcbe871f38a3b249400080c080a027094150a21e8d9485c58d1459254e334e8482c3dea46c8ef28aedada3e53c07a01bf9d6673eac1cc5a956070a6a38c954f07867d611964d49cc42940034cd103f'

    const result = await bridgeDisputeManager.verifyRawTx.call(transaction, rawTx);
    assert.isNotTrue(result);
  });

  it("first byte < 0x7f, return byte itself", async function () {
    const decoded = await rlpDecoder.decode('0x61');
    assert.equal(4, decoded[0].length)
    assert.equal(decoded[0], '0x61')
  });

  it("first byte < 0xb7, data is everything except first byte", async function () {
    const decoded = await rlpDecoder.decode('0x83646f67');
    assert.equal(8, decoded[0].length)
    assert.equal(decoded[0], '0x646f67')
  });


  it("first byte == 0x80, data is null", async function () {
    const decoded = await rlpDecoder.decode('0x80');
    assert.equal(decoded[0], '0x')
  });

  it('strings over 55 bytes long',async  function () {
    const testString =
      'This function takes in a data, convert it to buffer if not, and a length for recursion'
    const testBuffer = Buffer.from(testString)
    const encoded = rlp.encode(testBuffer)
    //console.log(testBuffer.toString('hex'));
    const encodedHex = "0x" + Buffer.from(new Uint8Array(encoded)).toString("hex")
    const decoded = await rlpDecoder.decode(encodedHex);
    assert.equal(Buffer.from(decoded[0].slice(2), 'hex').toString(), testString)
  })

  it('a list', async function () {
    const list = [
      '0x54686973',
      "0x546869732066756e6374696f6e2074616b657320696e206120646174612c20636f6e7665727420697420746f20627566666572206966206e6f742c20616e642061206c656e67746820666f7220726563757273696f6e",
      '0x07',
      '0x05',
      ,
    ]
    const encoded = rlp.encode(list)
    const encodedHex = "0x" + Buffer.from(new Uint8Array(encoded)).toString("hex")
    const decoded = await rlpDecoder.decode(encodedHex);
    assert.deepEqual(decoded, ['0x54686973',"0x546869732066756e6374696f6e2074616b657320696e206120646174612c20636f6e7665727420697420746f20627566666572206966206e6f742c20616e642061206c656e67746820666f7220726563757273696f6e", '0x07', '0x05','0x']);
  })

  it('a list  over 55 bytes long', async function () {
    const list = ['This', 'function', 'takes', 'in', 'a', 'data', 'convert', 'it', 'to', 'buffer', 'if', 'not', 'and', 'a', 'length', 'for', 'recursion', 'a1', 'a2', 'a3', 'ia4', 'a5', 'a6', 'a7', 'a8', 'ba9']

    const encoded = rlp.encode(list)
    const encodedHex = "0x" + Buffer.from(new Uint8Array(encoded)).toString("hex")
    const decoded = await rlpDecoder.decode(encodedHex);
    
    const decodedBuffer = rlp.decode(encoded)
    let rlpdecoded = []
    for (let i = 0; i < decodedBuffer.length; i++) {
      rlpdecoded[i] = "0x" + decodedBuffer[i].toString('hex');
    }

    assert.deepEqual(decoded, rlpdecoded)
  })

  it("decode a long list using actual data", async function () {

    const string = '0xf90131a0b7030de7565b7531315fefd37f135a84fcfc82896e38bf7321d458d6846c4285a04c05e9cd442533a0fe8cfa6948540dc3e178f6add3fe1a4a253694d345b97198a0667e9f9a0e2a7ee536a4c9bd2013d06296430ae8181ea08c76c737debf379d63a01d1146f205eaeca9bf69943a5882e81de1ac7e7fceaf112af76bf29deb34bc47a022715dfc9109f2e78dbc177f48b3e181ad3044b936e3d50ddc958c42ff76a23fa00c32dd02fc4143baa82d42182151637ac256e6262036dc9c353c561b8b15b8d1a055c39110aff8d0a5469fd6a3dfa966dbbd0ae726c8ecab006a3093806c45e03ba0d6bdf0cc3e37ae46f2a295d18f35cd019bb4d189a1c18fb94ae38e70c6b8eae8a0cedb936c7df2fb8e6720770b3eab8ff0320182b0e2a28c517e38bcbdbc13178f8080808080808080';

    const encoded = Buffer.from(string.slice(2), 'hex');
    const decodedBuffer = rlp.decode(encoded)
    const estimate = await rlpDecoder.decode.estimateGas(string);
    const decoded = await rlpDecoder.decode(string);
    let rlpdecoded = []
    for(let i = 0; i < decodedBuffer.length ;i++) {
      rlpdecoded[i] = "0x" + decodedBuffer[i].toString('hex');
    }
    assert.deepEqual(decoded, rlpdecoded)
  });




});

