import LitJsSdk from "@lit-protocol/sdk-browser";

/**   This example is running on an older version of the
*     Lit JS SDK on a deprecated network - serrano. 
*     Check out the developer docs for the most up to date
*     version: https://developer.litprotocol.com/
*/
const client = new LitJsSdk.LitNodeClient({
  litNetwork: 'serrano',
});

const chain = "ethereum";

// Checks if the user has at least 0 ETH
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "0",
    },
  },
];

class Lit {
  litNodeClient;

  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }

  async encryptFile(file) {
    if (!this.litNodeClient) {
      await this.connect();
    }
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({ file });

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions: accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });

    return {
      encryptedFile: encryptedFile,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
    };
  }

  async decryptFile(encryptedFile, encryptedSymmetricKey) {
    if (!this.litNodeClient) {
      await this.connect();
    }

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions: accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig
    });

    const decryptedFile = await LitJsSdk.decryptFile({
      file: encryptedFile,
      symmetricKey
    });
    return decryptedFile;
  }
}

export default new Lit();
