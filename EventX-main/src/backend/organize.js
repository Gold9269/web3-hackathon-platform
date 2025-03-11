export class OrganizeService{
    async createHackathon(data){
        const response = await fetch("http://localhost:3000/api/v1/hackathon/organizer/create",{
            method: "POST",
                credentials: "include",
            body: data,
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    }

    async getHackathon(id){
        const response = await fetch(`http://localhost:3000/api/v1/hackathon/organizer/${id}`, {
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
    }

    async addRound(id,data){
        //params mei name daalna hoga mp ek hackathon ko get krne ke baad ek button lagainge add round ka toh hojaiga
        const response = await fetch(`http://localhost:3000/api/v1/hackathon/organizer/${id}/rounds/add`, {
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
    }

    async getRounds (id){
        const response = await fetch(`http://localhost:3000/api/v1/hackathon/organizer/${id}/rounds`,{
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            }
        });
        const result = await response.json();
        return result;
        
    }

    async showSubmissions(name){
        const response = await fetch(`http://localhost:3000/api/v1/hackathon/organizer/${name}/submissions`, {
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
    }

    async announceWinners(name,data){
        const response = await fetch(`http://localhost:3000/api/v1/hackathon/organizer/${name}/announce-winners`, {
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
    }

    async getAllHackathons(){
        const response = await fetch('http://localhost:3000/api/v1/hackathon/organizer/browse-events',
            {
                method: "GET",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                }
            }
        )
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        return result.hackathons;
    }
}

const organizeService =  new OrganizeService();

export default organizeService;