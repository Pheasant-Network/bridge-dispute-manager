const testTransferTx = require('./data/checkTransferTx.json');
const testTx = require('./data/tx.json');
const testBlockHeader = require('./data/blockHeader.json');
const testProof = require('./data/proof.json');

class TestData {
  constructor(_accounts) {
    this.accounts = _accounts;
  }

  getTransferTxData(index) {
    return testTransferTx[index];
  }
  getTxData(index) {
    return testTx[index];
  }

  getBlockHeaderData(index) {
    return testBlockHeader[index];
  }

  getProofData(index) {
    return testProof[index];
  }

}

exports.TestData = TestData;
