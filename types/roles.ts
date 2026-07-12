



// src/types/roles.ts


export type Control = {
    id: number;
    name: string;
    key: string;
  };
  
  export type PermissionGroup = {
    name: string;
    controls: Control[];
  };
  

export type { Role, Permission } from "@/store/roles/types";





