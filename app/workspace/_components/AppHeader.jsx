import React from "react";
import {UserButton} from '@clerk/nextjs'
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from 'next/image'

function AppHeader({hideSidebar=false}) {
    return(
        <div className="p-4 flex justify-between items-center shadow">
            {!hideSidebar && <SidebarTrigger />}
            <Image src="/banlogo.png" alt='logo' width={230} height={220} />
           
            <UserButton />
        </div>
    )
}

export default AppHeader