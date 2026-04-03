import { Wallet, SigningKeypair } from "@stellar/typescript-wallet-sdk";

/**
 * Xác thực với MoneyGram sử dụng SEP-10
 * @param {string} authSecretKey - Secret key của ví NexLab
 */
async function authenticateWithMoneyGram(authSecretKey) {
    try {
        console.log("--- Bắt đầu xác thực với MoneyGram (Testnet) ---");

        // 1. Khởi tạo Wallet cho môi trường Testnet
        const wallet = Wallet.TestNet();

        // 2. Định nghĩa Host của MoneyGram (Home Domain cho Testnet)
        const MGI_HOME_DOMAIN = "extstellar.moneygram.com";

        // 3. Khởi tạo đối tượng Anchor
        const anchor = wallet.anchor({ homeDomain: MGI_HOME_DOMAIN });

        // 4. Lấy đối tượng xử lý SEP-10 (Xác thực)
        const sep10 = await anchor.sep10();

        // 5. Tạo Keypair từ Secret Key của ứng dụng (NexLab Signing Key)
        const authKey = SigningKeypair.fromSecret(authSecretKey);

        console.log("Đang gửi yêu cầu xác thực tới MoneyGram...");
        console.log("Client Domain sử dụng: thong442001.github.io/MoneyGram-XLM-testnet");

        // 6. Thực hiện xác thực toàn bộ các bước (Challenge -> Sign -> Token)
        // Cần truyền thêm clientDomain để MoneyGram có thể verify file stellar.toml của mày
        const authToken = await sep10.authenticate({ 
            accountKp: authKey,
            clientDomain: "thong442001.github.io/MoneyGram-XLM-testnet" 
        });

        console.log("✅ Xác thực thành công!");
        console.log("JWT Token của mày đây:");
        console.log("-----------------------");
        console.log(authToken);
        console.log("-----------------------");
        
        return authToken;

    } catch (error) {
        // Log chi tiết lỗi để debug
        if (error.data && error.data.responseData) {
            console.error("❌ Lỗi từ Server MoneyGram:", error.data.responseData.error);
        } else {
            console.error("❌ Lỗi xác thực SEP-10:", error.message);
        }
        
        // Thêm gợi ý nếu lỗi do domain
        if (error.message.includes("client_domain")) {
            console.log("💡 Gợi ý: Hãy đảm bảo file stellar.toml đã được cập nhật trên GitHub.");
        }
        
        throw error;
    }
}

// --- PHẦN CHẠY THỬ ---
// Tuyệt đối không để lộ Secret Key này khi push code lên GitHub nhé Thống!
const MY_SECRET_KEY = "SDBRFDLFN7K5ARWO54W6EROVK2XN5WTKZZMJSBJWUBPRRLGETE7J7POL"; 

if (MY_SECRET_KEY && MY_SECRET_KEY.startsWith("S")) {
    authenticateWithMoneyGram(MY_SECRET_KEY);
} else {
    console.error("Vui lòng điền Secret Key thật vào biến MY_SECRET_KEY để test.");
}