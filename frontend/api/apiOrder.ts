
import { fetchWithAuth } from "./apiClient"
import { API_ENDPOINTS } from "./apiConfig"


/**
 * Order Interface
 */
export interface OrderUser {
    _id: string
    first_name?: string
    last_name?: string
    account_id?: { email?: string }
}

export interface Order {
    _id?: string
    orderCode: number
    // Backend trả về string (id) hoặc object User đã populate cho admin
    userId: string | OrderUser
    voucherId?: string
    totalToken: number
    price: number
    totalAmount?: number
    status?: "pending" | "completed" | "cancelled"
    paymentMethod: string
    createdAt?: string
    updatedAt?: string
}


/**
 * Create a new order
 * @param data - Order creation payload ({voucherId, totalToken, price, paymentMethod})
 * @returns Promise with created order
 */
export async function createOrder(data: Order) {
    return fetchWithAuth(API_ENDPOINTS.ORDER.CREATE_ORDER, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/**
 * Update order status
 * @param id - Order ID
 * @param status - Status string ("pending" | "completed" | "cancelled")
 * @returns Promise with updated order
 */
export async function updateOrderStatus(id: string, status: string) {
    return fetchWithAuth(API_ENDPOINTS.ORDER.UPDATE_ORDER_STATUS(id), {
        method: "PATCH",
        body: JSON.stringify({ status }),
    })
}

/**
 * Get order by orderCode
 * @param orderCode - Order code
 * @returns Promise with order detail
 */
export async function getOrderByOrderCode(orderCode: string) {
    return fetchWithAuth(API_ENDPOINTS.ORDER.GET_ORDER_BY_CODE(orderCode), {
        method: "GET",
    })
}

/**
 * Get order history for current user
 * @returns Promise with list of user's orders
 */
export async function getOrderHistory() {
    return fetchWithAuth(API_ENDPOINTS.ORDER.GET_ORDER_HISTORY, {
        method: "GET",
    });
}

/**
 * Get all order history for admin
 * @returns Promise with list of all orders
 */
export async function getOrderHistoryAdmin() {
    return fetchWithAuth(API_ENDPOINTS.ORDER.GET_ORDER_HISTORY_ADMIN, {
        method: "GET",
    });
}
