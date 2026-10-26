const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const keccak256 = require("ethereum-cryptography/keccak.js").keccak256;
const secp256k1 = require("ethereum-cryptography/secp256k1").secp256k1;
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

// Адреса - публичные ключи из client/private/keys.txt
const balances = {
  "03b47720a166ed61c28910c886a2012c3e6fc20e46eeb15576891a03fd2f054ba3": 100,
  "03cc1965b877d703fd6108fb98df6c17732f6f740bb67e631f906d23879d40bc96": 50,
  "03715d5c19644df7883b7fcee0359fe9a2316222b52ee6025e7a42a7bbae171b29": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

// Домашнее задание: хеш считается от ВСЕХ полей транзакции,
// поэтому подпись нельзя использовать для другой суммы или другого получателя.
// Сообщение собирается так же, как на клиенте (Transfer.jsx).
function hashTransaction(sender, amount, recipient) {
  const message = JSON.stringify({ sender, amount, recipient });
  return keccak256(utf8ToBytes(message));
}

app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).send({ message: "Invalid amount!" });
  }

  let isSigned = false;
  try {
    const txHash = hashTransaction(sender, amount, recipient);
    isSigned = secp256k1.verify(hexSign, txHash, sender);
  } catch (e) {
    isSigned = false; // некорректный формат подписи или ключа
  }
  console.log("Is signed: ", isSigned);

  if (isSigned) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Not signed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
