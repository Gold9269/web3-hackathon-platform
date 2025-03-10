export class AuthService{
    async createAccount(data){
        try {
            const response = await fetch("http://localhost:3000/api/v1/user/register", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.log("Error while registering",error);
            throw error;
        }
    }

    async logIn(data){
        try {
            const response = await fetch("http://localhost:3000/api/v1/user/login", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.log("Error while logging in",error);
            throw error;
        }
    }

    async getCurrentUser(){
        try {
            const response = await fetch("http://localhost:3000/api/v1/user/current-user", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                if(response.status===401){
                    console.log('No active session. Guest user.');
                    return null;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);                
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.log("getCurrentUser",error);
        }
        return null;
    }

    async logout() {
        try {
            const response = await fetch("http://localhost:3000/api/v1/user/logout", {
                method: "POST", // or "GET" depending on your backend
                credentials: "include", // Ensures cookies are sent and deleted properly
                headers: {
                    "Content-Type": "application/json",
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            console.log("User logged out successfully");
            return true; // Can use this to update UI state
    
        } catch (error) {
            console.error("Error while logging out:", error);
            return false;
        }
    }    
}

const authService =  new AuthService();

export default authService;