import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);

    let address = "";
    try {
      // публичный ключ (адрес) вычисляется из приватного на стороне клиента
      address = toHex(secp.secp256k1.getPublicKey(privateKey));
    } catch (e) {
      address = ""; // ключ введён не полностью или некорректен
    }
    setAddress(address);

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type your private key" value={privateKey} onChange={onChange}></input>
      </label>

      <div>Address: {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "-"}</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
