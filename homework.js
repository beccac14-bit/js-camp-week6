// ========================================
// 第六週作業：電商 API 資料串接練習
// 執行方式：node homework.js
// 環境需求：Node.js 18+（內建 fetch）
// ========================================

// 載入環境變數
require("dotenv").config({ path: ".env" });

// API 設定（從 .env 讀取）
const API_PATH = process.env.API_PATH; //becca
const BASE_URL = "https://livejs-api.hexschool.io";
const ADMIN_TOKEN = process.env.API_KEY;

// ========================================
// 任務一：基礎 fetch 練習
// ========================================

/**
 * 1. 取得產品列表
 * 使用 fetch 發送 GET 請求
 * @returns {Promise<Array>} - 回傳 products 陣列
 */
async function getProducts() {
	// 請實作此函式
	// 提示：
	// 1. 使用 fetch() 發送 GET 請求
	// 2. 使用 response.json() 解析回應
	// 3. 回傳 data.products
	const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`);

	const data = await response.json();
	return data.products;
}

/**
 * 2. 取得購物車列表
 * @returns {Promise<Object>} - 回傳 { carts: [...], total: 數字, finalTotal: 數字 }
 */
async function getCart() {
	// 請實作此函式
	const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`);
	const data = await response.json();
	return {
		carts: data.carts,
		total: data.total,
		finalTotal: data.finalTotal };

};

/**
 * 3. 錯誤處理：當 API 回傳錯誤時，回傳錯誤訊息
 * @returns {Promise<Object>} - 回傳 { success: boolean, data?: [...], error?: string }
 */
async function getProductsSafe() {
	// 請實作此函式
	// 提示：
	// 1. 加上 try-catch 處理錯誤
	// 2. 檢查 response.ok 判斷是否成功
	// 3. 成功回傳 { success: true, data: [...] }
	// 4. 失敗回傳 { success: false, error: '錯誤訊息' }

	let errorObj = null; // 不然在 try 裡面定義變數的話，因為作用域的關係，catch 抓不到 
	try{
		const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`);
    
		if(!response.ok){
			errorObj = {
				success: response.ok ,
				error: `錯誤訊息：${response.status}`
			}
			throw new Error("錯誤訊息");
		};

		const data = await response.json();
		// console.log(data); 測試用
		// console.log({ success: data.status, data: data.products }); 驗證用  
		return { success: data.status, data: data.products };   
	} catch(error) {
	  console.log( errorObj || {success: false, error: error.message} );
	  return( errorObj || {success: false, error: error.message} )
  };
};

// 寫法二：
async function getProductsSafe() {
  try {
    const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`);

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || '取得產品失敗' }; 
	  // 直接 return 整個物件，並中止函式運算。
	  // 透過 || 短路邏輯，只要左邊有字串，就是 truthy 值跑左邊；
	  // 左邊為 "" 空字串、undefined 為 falsy 值，就會跑右邊
    }

    const data = await response.json();
    return { success: true, data: data.products };

  } catch (error) {

    return { success: false, error: error.message }; // 直接回傳 {} 整個物件
  }
}

// ========================================
// 任務二：POST 請求 - 購物車操作
// ========================================

/**
 * 1. 加入商品到購物車
 * @param {string} productId - 產品 ID
 * @param {number} quantity - 數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function addToCart(productId, quantity) {
	// 請實作此函式
	// 提示：
	// 1. 發送 POST 請求
	// 2. body 格式：{ data: { productId: "xxx", quantity: 1 } }
	// 3. 記得設定 headers: { 'Content-Type': 'application/json' }
	// 4. body 要用 JSON.stringify() 轉換

	const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`,{
		method:'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( {data: { productId, quantity} } )
		}
	);
	const data = await response.json();
	return data;
};

// 測試用
addToCart("2kkjjO34eH2jzlXVHl0j", 5) // Jordan 雙人床架／雙人加大

/**
 * 2. 編輯購物車商品數量
 * @param {string} cartId - 購物車項目 ID
 * @param {number} quantity - 新數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function updateCartItem(cartId, quantity) {
	// 請實作此函式
	// 提示：
	// 1. 發送 PATCH 請求
	// 2. body 格式：{ data: { id: "購物車ID", quantity: 數量 } }
	
	const newQuantity = Number(quantity);
	if(newQuantity < 1){
		return
	};

	const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`,{
		method:'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( { data: { id: cartId, quantity: newQuantity} }) 
		});
	
	const data = await response.json(); 
	return data;
};


/**
 * 3. 刪除購物車特定商品
 * @param {string} cartId - 購物車項目 ID
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function removeCartItem(cartId) {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts/{id}
	const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts/${cartId}`, {
		method: "DELETE"
	});
	const data = await response.json();
	return data.carts;
}

/**
 * 4. 清空購物車
 * @returns {Promise<Object>} - 回傳清空後的購物車資料
 */
async function clearCart() {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts
	const response = await fetch(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`, {
		method: "DELETE"
	});
	const data = await response.json();
	console.log(data); // 驗證是否有回傳「"購物車產品已全部清空。 (*´▽`*)"」
  	console.log(data.carts); // 應為 [] 空陣列
  return data;
}

// ========================================
// HTTP 知識測驗 (額外練習)
// ========================================

/*
請回答以下問題（可以寫在這裡或另外繳交）：

1. HTTP 狀態碼的分類（1xx, 2xx, 3xx, 4xx, 5xx 各代表什麼）
   答：
		1xx：資訊回應，代表對方收到了正在處理中，但實務上比較少見
		2xx：成功回應，代表處理成功，例如 200 OK 但表成功、201 Created 代表 POST 成功創建
		3xx：重新導向訊息，可能是 301 網址搬家請移到新網址、304 代表 catch 還在不用重新從伺服器下載
		4xx：用戶端錯誤，可能是沒有資格訪問、或是 API 錯誤、404 url 不存在等
		5xx：伺服器錯誤，代表後端伺服器有問題，例如 500 Internal Server Error
2. GET、POST、PATCH、PUT、DELETE 的差異
   答：
		GET：跟對方要資料，例如一般網頁讀取（如：新聞文章），URL 可以收進書籤（如：http://test/id:1234)
		POST：帶著資訊去請求連線，通常是夾帶隱私資訊在 Request Body 中（如：帶著帳號密碼請求登入），因為是私密的，URL 不能收藏進書籤
		PATCH：帶著部分資訊，想要修改部分資訊（如：更新使用者的名稱）
		PUT：帶著完整資訊，想要修改完整資訊（如：更新使用者的所有內容（名稱、大頭貼、地址）），如果沒寫完整其他欄位會變成空值
		DELETE：刪除資訊，不需要夾帶 body 資訊

3. 什麼是 RESTful API？
   答：符合 REST 規範的 API 又會被稱為 RESTful API，它是一種系統溝通的思維方式。
   想像如果今天不同 APP 要跟伺服器要資料，每家公司都傳不同格式，非常沒有效率且學習成本高昂。
   通常 RESTful API 會有幾個原則：
   1.使用 Http method，去表示要執行的資料庫操作
	例如：GET 對應資料庫的處理方法 READ、POST 對應 CREATE、PUT 對應 UPDATE 等
   2.使用 url 路徑，描述資源之間的階層關係
	透過統一架構的 url，運用 / 清楚表示資源之間的關係，例如：
	GET/users
	GET/users/123
   3. Response body 返回 JSON 或是 XML 格式
	統一格式好解析

   補充：REST 是甚麼？是一種系統溝通的思維方式，通常有以下原則：
   1. Uniform Interface，就像是 API 的網址會有一個相同的結構，一眼就可以辨別
  	GET /api/livejs/v1/customer/{api_path}/products
	GET /api/livejs/v1/customer/{api_path}/carts
   2. Stateless，伺服器不會記住請求，你要自己夾帶這些請求給伺服器。不然特定請求只能找特定伺服器，很沒效率。
   3. Client-Server Separation 客戶端和伺服器分開，兩者可以各自升級不影響。
	同樣 API，可以用在網頁、手機 App、桌面 App；如果伺服器跟客戶端綁死要支援不同的客戶端，就要開發不同的 API，開發成本會上升。
   4. Cacheable 可快取，伺服器會明確告訴你是否可以快取、快取時間，才不會每次都要重新登入
   5. Layered System 分層系統，當呼叫 api.github.com 時，請求可能會經過：負載平衡器（分散流量）>快取伺服器（儲存常用資料）>認證服務（驗證身份）
	>資料庫伺服器（儲存資料）。但我只需要對一個 URL 發出請求，分層系統自己會處理，維護起來也很明確方便。


*/

// ========================================
// 匯出函式供測試使用
// ========================================
module.exports = {
	API_PATH,
	BASE_URL,
	ADMIN_TOKEN,
	getProducts,
	getCart,
	getProductsSafe,
	addToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
};

// ========================================
// 直接執行測試
// ========================================
if (require.main === module) {
	async function runTests() {
		console.log("=== 第六週作業測試 ===\n");
		console.log("API_PATH:", API_PATH);
		console.log("");

		if (!API_PATH) {
			console.log("請先在 .env 檔案中設定 API_PATH！");
			return;
		}

		// 任務一測試
		console.log("--- 任務一：基礎 fetch ---");
		try {
			const products = await getProducts();
			console.log(
				"getProducts:",
				products ? `成功取得 ${products.length} 筆產品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getProducts 錯誤:", error.message);
		}

		try {
			const cart = await getCart();
			console.log(
				"getCart:",
				cart ? `購物車有 ${cart.carts?.length || 0} 筆商品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getCart 錯誤:", error.message);
		}

		try {
			const result = await getProductsSafe();
			console.log(
				"getProductsSafe:",
				result?.success ? "成功" : result?.error || "回傳 undefined",
			);
		} catch (error) {
			console.log("getProductsSafe 錯誤:", error.message);
		}

		console.log("\n=== 測試結束 ===");
		console.log("\n提示：執行 node test.js 進行完整驗證");
	}

	runTests();
}
