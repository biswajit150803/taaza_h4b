module donation::donation_reward {
    use std::signer;
    use aptos_framework::aptos_account;

    public entry fun reward_donor(admin: &signer, recipient: address) {
        let amount = 1_000_000; // 0.01 APT
        aptos_account::transfer(admin, recipient, amount);
    }
    public entry fun charge_inventory_user(user: &signer, admin: address) {
        let amount = 2_000_000; // 0.02 APT
        aptos_account::transfer(user, admin, amount);
    }
}
