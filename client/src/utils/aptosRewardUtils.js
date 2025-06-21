import {
  Aptos,
  Network,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";

// ✅ Load sender's private key securely
const PRIVATE_KEY_HEX = import.meta.env.VITE_REWARD_SENDER_PRIVATE_KEY;

if (!PRIVATE_KEY_HEX?.startsWith("0x")) {
  throw new Error("VITE_REWARD_SENDER_PRIVATE_KEY is missing or invalid");
}

const privateKey = new Ed25519PrivateKey(PRIVATE_KEY_HEX);
const senderAccount = Account.fromPrivateKey({ privateKey });

const aptos = new Aptos({ network: Network.TESTNET });

/**
 * Sends APT to a user's wallet
 * @param {string} recipientAddress - Full Aptos wallet address (0x...)
 * @param {number} amountAPT - Amount in APT (default 0.01)
 */
export async function sendRewardToUser(recipientAddress, amountAPT = 0.01) {
  try {
    if (!/^0x[a-fA-F0-9]{64}$/.test(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }

    const senderAddr = senderAccount.accountAddress.toString();
    console.log("🪙 Sender:", senderAddr);

    // ✅ Confirm sender account exists and has funds
    const senderInfo = await aptos.getAccountInfo({ accountAddress: senderAddr });
    console.log("👛 sender funds:", senderInfo);

    // ✅ Confirm recipient account exists
    try {
      const recInfo = await aptos.getAccountInfo({ accountAddress: recipientAddress });
      console.log("👥 recipient exists:", recInfo);
    } catch {
      throw new Error("Recipient account is not activated on Aptos testnet.");
    }

    const octas = BigInt(Math.round(amountAPT * 1e8));
    console.log("💸 Sending:", amountAPT, "APT =", octas.toString(), "octas to", recipientAddress);

    // ✅ Debugging hook
    console.log("🔁 Calling transferCoinTransaction...");
    const result = await aptos.transferCoinTransaction({
      sender: senderAddr,
      senderAuthenticator: senderAccount,
      recipient: recipientAddress,
      amount: octas,
      options: {
        maxGasAmount: BigInt(1000),
        gasUnitPrice: BigInt(100),
        expirationTimestampSecs: BigInt(Math.floor(Date.now() / 1000) + 600),
      },
    });
    console.log("📥 transferCoinTransaction result:", result);

    if (!result?.hash) {
      console.error("📛 No hash in result:", result);
      throw new Error("Transaction failed or did not return a hash");
    }

    console.log("🚀 Submitted TX:", result.hash);
    await aptos.waitForTransaction({ transactionHash: result.hash });
    console.log("✅ Confirmed TX:", result.hash);
    return result.hash;
  } catch (err) {
    console.error("🛑 sendRewardToUser failed:", err);
    throw err;
  }
}