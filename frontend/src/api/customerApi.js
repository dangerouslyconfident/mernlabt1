/**
 * Centralized API Module for Customer Authentication Service (ShopKart Lab 1)
 * Handles all HTTP communications with credentials: 'include' for HttpOnly cookies.
 */

const BASE_URL = '/api/customers';

/**
 * Helper to process JSON responses and handle HTTP errors gracefully
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Task 1: Register a new customer
 * @param {Object} payload - { fullName, email, password, phone }
 */
export async function registerCustomer(payload) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Task 2: Login customer and receive HttpOnly cookie
 * @param {Object} payload - { email, password }
 */
export async function loginCustomer(payload) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Task 3: Fetch currently authenticated customer profile
 * Uses HttpOnly cookie automatically
 */
export async function getProfile() {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(response);
}

/**
 * Task 4: Logout customer and clear HttpOnly cookie
 */
export async function logoutCustomer() {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(response);
}

/**
 * Bonus Challenge: Change customer password
 * @param {Object} payload - { oldPassword, newPassword }
 */
export async function changePassword(payload) {
  const response = await fetch(`${BASE_URL}/change-password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
