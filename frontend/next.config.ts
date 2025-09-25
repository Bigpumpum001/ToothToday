import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    // domains:['dssffgyrxkstfgznqmas.supabase.co','43ac45f998cfb384eaf6d9e07cc0726e.r2.cloudflarestorage.com','minio:9000','localhost','127.0.0.1','storage.googleapis.com']
    domains:['storage.googleapis.com']
  }
};

export default nextConfig;
