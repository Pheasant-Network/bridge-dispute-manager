#!/bin/bash
abiPath="../v1-contracts-polygon/artifacts/contracts/tunnel/PolygonChildCheckPointManager.sol/" #Rewrite it according to your composition.
abiName="PolygonChildCheckPointManager.json"
optimismAbiPath="../v1-contracts-optimism/artifacts/contracts/cross-domain-message/OptimismChildCheckPointManager.sol/" #Rewrite it according to your composition.
optimismAbiName="OptimismChildCheckPointManager.json"
saveAbiPath="./abi/"

abi=$(cat ${abiPath}${abiName} | jq '.abi')
optimismAbi=$(cat ${optimismAbiPath}${optimismAbiName} | jq '.abi')
echo $abi > ${saveAbiPath}${abiName}
echo $optimismAbi > ${saveAbiPath}${optimismAbiName}
