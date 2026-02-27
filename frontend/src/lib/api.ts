import axios from "axios";

const api = axios.create({
    baseURL: 
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    headers:{
        "Content-Type" : "application/json"
    },

});

// interceptor ใส token อัตโนมัติ ถ้ามี login
api.interceptors.request.use((config)=>{
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token && config.headers){
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config
})
export default api

export const register = async (data:{name:string;email:string;password:string;phone:string})=>{
    const res = await api.post("/auth/register",data)
    return res.data
}
export const login = async (data:{email:string;password:string})=>{
    const res = await api.post("/auth/login",data)
    return res.data
}
export const googleLogin = async (id_token:string)=>{
    const res = await api.post("/auth/google-login",{id_token})
    return res.data
}
// export const getProfile = async ()=>{
//     const res = await api.get("/users/me")
//     return res.data
// }