# Priyannik Login Microservice (priyannikloginms)

Priyannik Login Microservice is a lightweight microservice for user authentication and registration. It is built using Cloudflare Workers and provides endpoints for managing users, logging in, and accessing public profiles with structured error handling.

## Features
- User login with token-based authentication
- Comprehensive error-code system for debugging

---

## Endpoints

### **GET /users/list?token=x**
Retrieve the list of all users.  
**Access:** Admin only  
**Parameters:**  
- `token` (required): A unique token generated after login.  

**Error Codes:**
- `1601`: Token missing
- `1602`: Token is invalid
- `1603`: Token doesn't belong to an admin account

---

### **GET /users/getPublicProfile?username=x**
Get the public profile data of a user.  
**Parameters:**  
- `username` (required): Username of the user.  

**Error Codes:**
- `1401`: `'username' parameter missing`
- `1402`: User not found

---

### **POST /users/add**
Register a new user.  
**Request Body:**  
JSON object containing the user details.  

**Error Codes:**
- `1001`: Too many accounts on the same IP
- `1002`: Invalid JSON body
- `1003`: Required parameters are not present
- `1004`: Username is invalid (must be alphanumeric, lowercase, 5-20 characters, underscore allowed, no spaces or special characters)
- `1005`: Email is invalid
- `1006`: User already exists

---

### **POST /users/login**
Login as a user and receive a token for further operations.  
**Request Body:**  
JSON object with `username` and `password`.  

**Error Codes:**
- `1201`: Invalid JSON body
- `1202`: Required parameters are not present
- `1203`: Username is invalid
- `1204`: Username not found
- `1205`: Password incorrect

---

## Error Codes
The system uses structured error codes to facilitate debugging. The format of the codes is as follows:

`ABCD`

- **A:** Module identifier (e.g., 1 for Login/Registration microservice)
- **B:** Operation type (e.g., Registration, Login, Logout, etc.)
- **CD:** Specific error

### Error Categories
| Error Code | Description                                                                                  |
|------------|----------------------------------------------------------------------------------------------|
| `1001-1006`| Errors related to registration operations                                                   |
| `1201-1205`| Errors related to login operations                                                          |
| `1301-1305`| Errors related to logout operations                                                         |
| `1401-1402`| Errors related to retrieving public profiles                                                |
| `1501-1507`| Errors related to user data updates                                                         |
| `1601-1603`| Errors related to admin user listing                                                        |

---

## How to Run the Microservice
1. Clone this repository:
   ```bash
   git clone https://github.com/priyannik/priyannikloginms.git
   cd priyannikloginms
   ```
2. Deploy the Cloudflare Worker using the instructions in the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).

---

## Contribution
Feel free to submit issues or pull requests to contribute to this project. Ensure your code follows the project's structure and coding guidelines.

---

## License
This project is licensed under the MIT License. See the [LICENCE](LICENCE) file for details.
