import {
  Aptos,
  AptosConfig,
  Account,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";

// Set up client
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Get admin account from private key
const PRIVATE_KEY = process.env.APTOS_REWARD_SENDER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("APTOS_REWARD_SENDER_PRIVATE_KEY is missing from env");
}
const adminAccount = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
});

export async function sendRewardToUser(recipientAddress) {
  try {
    // Build the transaction payload
    const txPayload = {
      sender: adminAccount.accountAddress,
      data: {
        function: `${adminAccount.accountAddress}::donation_reward::reward_donor`,
        typeArguments: [],
        functionArguments: [recipientAddress],
      },
    };

    // 👇 Use generateTransaction, not build.transaction
    const txn = await aptos.transaction.build.simple(txPayload);

    // Sign + submit
    const submittedTxn = await aptos.signAndSubmitTransaction({
      signer: adminAccount,
      transaction: txn,
    });

    // Wait for confirmation
    await aptos.waitForTransaction({ transactionHash: submittedTxn.hash });

    console.log("✅ APT reward sent. Tx hash:", submittedTxn.hash);
    return submittedTxn.hash;
  } catch (err) {
    console.error("❌ APTOS REWARD ERROR:", err.message);
    throw err;
  }
}
